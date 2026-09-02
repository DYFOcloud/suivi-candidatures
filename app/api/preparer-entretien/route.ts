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

  const { entretienId, langue } = await request.json();

  const { data: e } = await supabase
    .from("entretiens")
    .select("*, candidatures(*)")
    .eq("id", entretienId)
    .single();

  if (!e) {
    return NextResponse.json({ erreur: "Entretien introuvable" }, { status: 404 });
  }

  const c = e.candidatures;

  if (!c?.offre_texte) {
    return NextResponse.json(
      { erreur: "Le texte de l'offre est manquant sur cette candidature." },
      { status: 400 }
    );
  }

  const contenu: Anthropic.MessageParam["content"] = [];

  if (c.cv_path) {
    const { data: fichier } = await supabase.storage.from("documents").download(c.cv_path);
    if (fichier) {
      const buffer = await fichier.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      contenu.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: base64 },
      });
    }
  }
    const enAnglais = langue === "en";

  const consigne = `Tu prépares un candidat à un entretien d'embauche.

Étape de l'entretien : ${e.etape}
Poste : ${c.poste}
Entreprise : ${c.entreprise}

Réponds UNIQUEMENT avec un objet JSON, sans texte avant ni après, sans balises markdown.

Format attendu :
{
  "questions": [
    { "question": "...", "theme": "Parcours | Motivation | Technique | Comportemental | Culture | Rémunération", "probabilite": "Très probable | Probable | Possible" }
  ],
  "vigilance": ["2 à 4 points du CV susceptibles d'appeler une question délicate pour cette offre"],
  "questions_a_poser": ["3 à 5 questions pertinentes que le candidat peut poser à son interlocuteur"],
  "arguments_cles": ["3 points du profil à faire passer absolument pendant cet entretien"]
}

Règles :
- Génère 8 à 12 questions, adaptées à l'étape "${e.etape}" — un entretien RH ne pose pas les mêmes questions qu'un entretien manager ou N+2
- Les questions doivent être ancrées dans l'offre et le CV, pas génériques
- Ne fournis PAS de pistes de réponse, uniquement les questions
- Les questions à poser doivent montrer une vraie préparation, pas des banalités
${enAnglais ? "- Rédige TOUT le contenu en anglais (questions, thèmes, vigilance, arguments)" : "- Rédige tout le contenu en français"}

Voici le texte de l'offre :
${c.offre_texte.slice(0, 15000)}`;

  contenu.push({ type: "text", text: consigne });
    try {
    const reponse = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 3000,
      messages: [{ role: "user", content: contenu }],
    });

    const bloc = reponse.content[0];
    if (bloc.type !== "text") {
      return NextResponse.json({ erreur: "Réponse inattendue" }, { status: 500 });
    }

    const nettoye = bloc.text.replace(/```json|```/g, "").trim();
    const preparation = JSON.parse(nettoye);

    await supabase
      .from("entretiens")
      .update({ preparation_json: preparation, preparation_langue: langue })
      .eq("id", entretienId);

    return NextResponse.json(preparation);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { erreur: "Préparation impossible. Réessayez." },
      { status: 500 }
    );
  }
}
