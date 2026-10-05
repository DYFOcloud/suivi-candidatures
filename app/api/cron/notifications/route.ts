import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SEUIL_RELANCE = 21;
const BASE_URL = "https://suivi-candidature-orpin.vercel.app";

function joursDepuis(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatHeure(d: string) {
  return new Date(d).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
}

async function envoyerEmail(destinataire: string, sujet: string, html: string) {
  const reponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Joply <contact@joply.fr>",
      to: destinataire,
      subject: sujet,
      html,
    }),
  });

  if (!reponse.ok) {
    console.error("Echec envoi email:", await reponse.text());
    return false;
  }
  return true;
}

function gabarit(titre: string, corps: string) {
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; color: #111827;">
  <p style="font-size: 20px; font-weight: 700; color: #6D28D9; margin: 0 0 24px;">Joply</p>
  <h1 style="font-size: 18px; margin: 0 0 16px;">${titre}</h1>
  ${corps}
  <p style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E5E7EB; font-size: 12px; color: #9CA3AF;">
    Vous recevez cet email car vous avez activé les rappels dans vos préférences.
    <a href="${BASE_URL}/profil" style="color: #9CA3AF;">Modifier mes préférences</a>
  </p>
</div>`.trim();
}
export async function GET(request: Request) {
  const autorisation = request.headers.get("authorization");
  if (autorisation !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const aujourdhui = new Date();
  const estLundi = aujourdhui.getDay() === 1;
  const dateJour = aujourdhui.toISOString().slice(0, 10);

  const { data: profils } = await admin
    .from("profils")
    .select("id, notif_a_envoyer, notif_relances, notif_entretiens, derniere_notif_hebdo");

  const { data: utilisateurs } = await admin.auth.admin.listUsers();

  const emails = new Map<string, string>();
  for (const u of utilisateurs?.users ?? []) {
    if (u.email) emails.set(u.id, u.email);
  }

  let envoyes = 0;

  for (const p of profils ?? []) {
    const email = emails.get(p.id);
    if (!email) continue;

    // 1. Rappel d'entretien — la veille
    if (p.notif_entretiens !== false) {
      const demain = new Date();
      demain.setDate(demain.getDate() + 1);
      const debutDemain = `${demain.toISOString().slice(0, 10)}T00:00:00`;
      const finDemain = `${demain.toISOString().slice(0, 10)}T23:59:59`;

      const { data: entretiens } = await admin
        .from("entretiens")
        .select("*, candidatures(entreprise, poste)")
        .eq("user_id", p.id)
        .eq("rappel_envoye", false)
        .gte("date_entretien", debutDemain)
        .lte("date_entretien", finDemain);

      for (const e of entretiens ?? []) {
        const corps = `
<p style="font-size: 14px; line-height: 1.6;">
  Vous avez un entretien <strong>demain, ${formatDate(e.date_entretien)} à ${formatHeure(e.date_entretien)}</strong>
  <span style="color: #6B7280;">(heure de Paris)</span>.
</p>
<table style="font-size: 14px; margin: 20px 0; border-collapse: collapse;">
  <tr><td style="padding: 4px 16px 4px 0; color: #6B7280;">Entreprise</td><td style="padding: 4px 0; font-weight: 600;">${e.candidatures?.entreprise ?? "—"}</td></tr>
  <tr><td style="padding: 4px 16px 4px 0; color: #6B7280;">Poste</td><td style="padding: 4px 0;">${e.candidatures?.poste ?? "—"}</td></tr>
  <tr><td style="padding: 4px 16px 4px 0; color: #6B7280;">Étape</td><td style="padding: 4px 0;">${e.etape}</td></tr>
  ${e.interlocuteur ? `<tr><td style="padding: 4px 16px 4px 0; color: #6B7280;">Interlocuteur</td><td style="padding: 4px 0;">${e.interlocuteur}</td></tr>` : ""}
  ${e.format ? `<tr><td style="padding: 4px 16px 4px 0; color: #6B7280;">Format</td><td style="padding: 4px 0;">${e.format}</td></tr>` : ""}
</table>
<a href="${BASE_URL}/candidatures/${e.candidature_id}" style="display: inline-block; background: #111827; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px;">Voir la fiche</a>`;

        const ok = await envoyerEmail(
          email,
          `Entretien demain chez ${e.candidatures?.entreprise ?? "—"}`,
          gabarit("Rappel d'entretien", corps)
        );

        if (ok) {
          await admin.from("entretiens").update({ rappel_envoye: true }).eq("id", e.id);
          envoyes++;
        }
      }
    }
        // 2. Récapitulatif hebdomadaire — le lundi
    if (estLundi && p.derniere_notif_hebdo !== dateJour) {
      const sections: string[] = [];

      if (p.notif_a_envoyer !== false) {
        const { data: aEnvoyer } = await admin
          .from("candidatures")
          .select("id, entreprise, poste, date_publication")
          .eq("user_id", p.id)
          .eq("statut", "À envoyer")
          .or("archivee.is.null,archivee.eq.false");

        if (aEnvoyer && aEnvoyer.length > 0) {
          const lignes = aEnvoyer
            .map(
              (c) =>
                `<li style="margin-bottom: 8px;"><a href="${BASE_URL}/candidatures/${c.id}" style="color: #111827; font-weight: 600; text-decoration: none;">${c.entreprise}</a> <span style="color: #6B7280;">— ${c.poste}</span></li>`
            )
            .join("");

          sections.push(`
<p style="font-size: 14px; font-weight: 600; margin: 24px 0 8px;">
  ${aEnvoyer.length} candidature${aEnvoyer.length > 1 ? "s" : ""} à envoyer
</p>
<ul style="font-size: 14px; padding-left: 20px; margin: 0;">${lignes}</ul>`);
        }
      }

      if (p.notif_relances !== false) {
        const { data: enAttente } = await admin
          .from("candidatures")
          .select("id, entreprise, poste, date_envoi")
          .eq("user_id", p.id)
          .eq("statut", "Envoyée")
          .eq("relance_notifiee", false)
          .not("date_envoi", "is", null);

        const aRelancer = (enAttente ?? []).filter(
          (c) => joursDepuis(c.date_envoi!) >= SEUIL_RELANCE
        );

        if (aRelancer.length > 0) {
          const lignes = aRelancer
            .map(
              (c) =>
                `<li style="margin-bottom: 8px;"><a href="${BASE_URL}/candidatures/${c.id}" style="color: #111827; font-weight: 600; text-decoration: none;">${c.entreprise}</a> <span style="color: #6B7280;">— sans réponse depuis ${joursDepuis(c.date_envoi!)} jours</span></li>`
            )
            .join("");

          sections.push(`
<p style="font-size: 14px; font-weight: 600; margin: 24px 0 8px;">
  ${aRelancer.length} relance${aRelancer.length > 1 ? "s" : ""} à faire
</p>
<ul style="font-size: 14px; padding-left: 20px; margin: 0;">${lignes}</ul>`);

          for (const c of aRelancer) {
            await admin
              .from("candidatures")
              .update({ relance_notifiee: true })
              .eq("id", c.id);
          }
        }
      }

      if (sections.length > 0) {
        const corps = `
<p style="font-size: 14px; line-height: 1.6;">Voici où en est votre recherche cette semaine.</p>
${sections.join("")}
<p style="margin-top: 28px;">
  <a href="${BASE_URL}" style="display: inline-block; background: #111827; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px;">Ouvrir Joply</a>
</p>`;

        const ok = await envoyerEmail(
          email,
          "Votre point hebdomadaire",
          gabarit("Point de la semaine", corps)
        );

        if (ok) {
          await admin
            .from("profils")
            .update({ derniere_notif_hebdo: dateJour })
            .eq("id", p.id);
          envoyes++;
        }
      }
    }
  }

  return NextResponse.json({ ok: true, envoyes });
}
