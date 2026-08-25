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

  const { candidatureId } = await request.json();

  const { data: c } = await supabase
    .from("candidatures")
    .select("*")
    .eq("id", candidatureId)
    .single();

  if (!c) {
    return NextResponse.json({ erreur: "Candidature introuvable" }, { status: 404 });
  }

  if (!c.cv_path) {
    return NextResponse.json({ erreur: "Aucun CV n'est associé à cette candidature." }, { status: 400 });
  }

  if (!c.offre_texte) {
    return NextResponse.json({ erreur: "Le texte de l'offre est manquant." }, { status: 400 });
  }

  const { data: fichier, error: erreurFichier } = await supabase.storage
    .from("documents")
    .download(c.cv_path);

  if (erreurFichier || !fichier) {
    return NextResponse.json({ erreur: "CV illisible." }, { status: 400 });
  }

  const buffer = await fichier.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");  const consigne = `Tu compares un CV à une offre d'emploi.

Réponds UNIQUEMENT avec un objet JSON, sans texte avant ni après, sans balises markdown.

Format attendu :
{
  "score": nombre entre 0 et 100,
  "points_forts": ["3 à 5 éléments du CV qui correspondent bien à l'offre"],
  "manques": ["3 à 5 exigences de l'offre absentes ou peu visibles dans le CV"],
  "suggestions": ["2 à 4 modifications concrètes à apporter au CV pour cette offre"]
}

Méthode de notation :
- Compétences techniques exigées présentes dans le CV : 40 points
- Expérience (secteur, niveau de responsabilité, années) : 30 points
- Formation et certifications : 15 points
- Vocabulaire de l'offre repris dans le CV : 15 points

Sois exigeant et précis. Un score de 100 signifie une adéquation parfaite, ce qui est rare.
Les suggestions doivent être actionnables : reformuler telle expérience, ajouter tel mot-clé, mettre en avant tel projet.

Voici le texte de l'offre :
${c.offre_texte.slice(0, 15000)}`;

  try {
    const reponse = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: base64 },
            },
            { type: "text", text: consigne },
          ],
        },
      ],
    });

    const bloc = reponse.content[0];
    if (bloc.type !== "text") {
      return NextResponse.json({ erreur: "Réponse inattendue" }, { status: 500 });
    }

    const nettoye = bloc.text.replace(/```json|```/g, "").trim();
    const analyse = JSON.parse(nettoye);

    await supabase
      .from("candidatures")
      .update({ score_correspondance: analyse.score, analyse_json: analyse })
      .eq("id", candidatureId);

    return NextResponse.json(analyse);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { erreur: "Analyse impossible. Le CV doit être un PDF." },
      { status: 500 }
    );
  }
}
