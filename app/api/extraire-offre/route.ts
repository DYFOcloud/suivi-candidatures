import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createClient } from "../../supabase-server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const { texte } = await request.json();

  if (!texte || texte.length < 50) {
    return NextResponse.json({ erreur: "Texte trop court" }, { status: 400 });
  }

  const prompt = `Voici le texte d'une offre d'emploi. Extrais les informations demandées.

Réponds UNIQUEMENT avec un objet JSON, sans texte avant ni après, sans balises markdown.

Format attendu :
{
  "entreprise": "nom de l'entreprise ou null",
  "poste": "intitulé du poste ou null",
  "lieu": "ville ou null",
  "type_contrat": "CDI, CDD, Stage, Alternance, Intérim, Freelance ou null",
  "date_publication": "date au format AAAA-MM-JJ ou null",
  "reference": "référence de l'offre ou null",
  "salaire_min": nombre annuel brut en euros ou null,
  "salaire_max": nombre annuel brut en euros ou null,
  "notes": "résumé en 2 phrases des missions principales et compétences demandées"
}

Règles :
- type_contrat : utilise exactement une de ces valeurs, sans variante
- date_publication : si l'offre indique "il y a 3 jours", calcule la date à partir d'aujourd'hui (${new Date().toISOString().slice(0, 10)})
- reference : cherche "Réf.", "Ref", "Référence", "Offre n°", ou un code alphanumérique identifiant l'offre
- Si un salaire est mensuel, multiplie par 12
- Si une fourchette est donnée, remplis min et max
- Si un seul chiffre, mets-le dans salaire_min
- Utilise null quand l'information est absente, jamais une chaîne vide

Texte de l'offre :
${texte.slice(0, 15000)}`;

  try {
    const reponse = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const bloc = reponse.content[0];
    if (bloc.type !== "text") {
      return NextResponse.json({ erreur: "Réponse inattendue" }, { status: 500 });
    }

    const nettoye = bloc.text.replace(/```json|```/g, "").trim();
    const donnees = JSON.parse(nettoye);

    return NextResponse.json(donnees);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { erreur: "Analyse impossible. Réessayez." },
      { status: 500 }
    );
  }
}
