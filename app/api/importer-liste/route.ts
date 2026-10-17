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

  const { texte } = await request.json();

  if (!texte || texte.length < 50) {
    return NextResponse.json({ erreur: "Texte trop court" }, { status: 400 });
  }
    const prompt = `Voici le contenu copié depuis la page « Mes candidatures » d'un site d'emploi. Extrais la liste des candidatures qui y figurent.

Réponds UNIQUEMENT avec un objet JSON, sans texte avant ni après, sans balises markdown.

Format attendu :
{
  "candidatures": [
    {
      "entreprise": "nom de l'entreprise",
      "poste": "intitulé du poste",
      "lieu": "ville ou null",
      "type_contrat": "CDI, CDD, Stage, Alternance, Intérim, Freelance, VIE, VIA ou null",
      "date_envoi": "date au format AAAA-MM-JJ ou null",
      "statut_source": "le libellé de statut tel qu'il apparaît dans le texte, ou null"
    }
  ]
}

RÈGLES IMPÉRATIVES :
- N'extrais QUE les candidatures réellement présentes dans le texte. N'en invente aucune.
- Si tu ne trouves aucune candidature, renvoie un tableau vide.
- entreprise et poste sont obligatoires. Ignore toute ligne où l'un des deux manque.
- Ignore les éléments de navigation, les filtres, les en-têtes de colonnes, les publicités et les suggestions d'offres.
- date_envoi : si le texte indique une date relative comme "il y a 3 jours" ou "postulé le 12 mars", calcule la date à partir d'aujourd'hui (${new Date().toISOString().slice(0, 10)}). Si l'année n'est pas précisée, déduis-la : une date postérieure à aujourd'hui appartient à l'année précédente.
- type_contrat : utilise exactement une des valeurs listées, sans variante. Mets null si le contrat n'est pas indiqué.
- statut_source : recopie littéralement le libellé trouvé, par exemple "Candidature envoyée", "Non retenue", "Profil consulté". Ne l'interprète pas.
- Utilise null quand une information est absente, jamais une chaîne vide.

Contenu à analyser :
${texte.slice(0, 30000)}`;
  try {
    const reponse = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const bloc = reponse.content[0];
    if (bloc.type !== "text") {
      return NextResponse.json({ erreur: "Réponse inattendue" }, { status: 500 });
    }

    const nettoye = bloc.text.replace(/```json|```/g, "").trim();
    const donnees = JSON.parse(nettoye);

    if (!Array.isArray(donnees.candidatures)) {
      return NextResponse.json(
        { erreur: "Aucune candidature détectée dans ce texte." },
        { status: 400 }
      );
    }

    await enregistrerAppel(supabase, user.id, "extraction");

    return NextResponse.json({ candidatures: donnees.candidatures });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { erreur: "Analyse impossible. Réessayez." },
      { status: 500 }
    );
  }
}
