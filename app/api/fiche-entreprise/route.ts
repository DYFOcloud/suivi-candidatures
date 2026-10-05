import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createClient } from "../../supabase-server";
import { verifierQuota, enregistrerAppel } from "../quotas";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const quota = await verifierQuota(supabase, user.id, "extraction", user.email);
  if (!quota.autorise) {
    return NextResponse.json({ erreur: quota.message }, { status: 429 });
  }

  const { candidatureId } = await request.json();

  const { data: c } = await supabase
    .from("candidatures")
    .select("entreprise, lieu")
    .eq("id", candidatureId)
    .single();

  if (!c) {
    return NextResponse.json({ erreur: "Candidature introuvable" }, { status: 404 });
  }
    const prompt = `Tu produis une fiche d'information sur une entreprise, destinée à un candidat qui prépare un entretien.

Entreprise : ${c.entreprise}
${c.lieu ? `Localisation mentionnée dans l'offre : ${c.lieu}` : ""}

Réponds UNIQUEMENT avec un objet JSON, sans texte avant ni après, sans balises markdown.

Format attendu :
{
  "nom": "nom officiel de l'entreprise ou null",
  "localisation": "siège social, ville et pays, ou null",
  "annee_creation": "année de création ou null",
  "effectif": "ordre de grandeur, par exemple 'environ 5 000 salariés', ou null",
  "secteur": "secteur d'activité ou null",
  "resume": "présentation de l'entreprise en 6 à 10 lignes maximum, ou null",
  "a_savoir": ["2 à 4 éléments utiles à connaître avant un entretien"],
  "fiabilite": "certaine | partielle | inconnue"
}

RÈGLES IMPÉRATIVES :
- Ne JAMAIS inventer. Si tu n'es pas certain d'une information, mets null.
- Si l'entreprise t'est inconnue, ou si plusieurs entreprises portent ce nom sans que tu puisses trancher, mets null partout, "a_savoir" vide, et "fiabilite": "inconnue".
- Si tu connais l'entreprise mais pas certains champs, remplis uniquement ceux dont tu es sûr et mets "fiabilite": "partielle".
- Mets "fiabilite": "certaine" uniquement pour une entreprise bien établie que tu connais précisément.
- "a_savoir" doit contenir des éléments concrets utiles en entretien, pas des généralités.
- Tes connaissances ont une date limite : ne présente pas des informations anciennes comme actuelles.`;

  try {
    const reponse = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const bloc = reponse.content[0];
    if (bloc.type !== "text") {
      return NextResponse.json({ erreur: "Réponse inattendue" }, { status: 500 });
    }

    const nettoye = bloc.text.replace(/```json|```/g, "").trim();
    const fiche = JSON.parse(nettoye);

    await supabase
      .from("candidatures")
      .update({ fiche_entreprise: fiche })
      .eq("id", candidatureId);

    await enregistrerAppel(supabase, user.id, "extraction");

    return NextResponse.json(fiche);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { erreur: "Génération impossible. Réessayez." },
      { status: 500 }
    );
  }
}
