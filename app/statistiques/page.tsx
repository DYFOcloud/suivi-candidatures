import { createClient } from "../supabase-server";
import { redirect } from "next/navigation";
import Courbe from "./Courbe";
import { STATUTS_REPONSE } from "../constantes";

export const dynamic = "force-dynamic";

const SEUIL_MINI = 5;

type Ligne = {
  cle: string;
  total: number;
  reponses: number;
  entretiens: number;
};

function pourcent(n: number, total: number) {
  if (total === 0) return "—";
  return `${Math.round((n / total) * 100)} %`;
}

export default async function Statistiques() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: candidatures } = await supabase.from("candidatures").select("*");
  const { data: historique } = await supabase.from("historique_statuts").select("*");
  const { data: entretiensData } = await supabase
    .from("entretiens")
    .select("candidature_id");

  const liste = candidatures ?? [];
  const envoyees = liste.filter((c) => c.statut !== "À envoyer");

  const idsAvecEntretien = new Set<string>();
  for (const e of entretiensData ?? []) {
    idsAvecEntretien.add(e.candidature_id);
  }
  for (const h of historique ?? []) {
    if (STATUTS_REPONSE.includes(h.nouveau_statut) && h.nouveau_statut !== "Refus") {
      idsAvecEntretien.add(h.candidature_id);
    }
  }

  const idsAvecReponse = new Set<string>();
  for (const h of historique ?? []) {
    if (STATUTS_REPONSE.includes(h.nouveau_statut)) {
      idsAvecReponse.add(h.candidature_id);
    }
  }
  for (const c of liste) {
    if (STATUTS_REPONSE.includes(c.statut)) idsAvecReponse.add(c.id);
  }

  const acceptees = liste.filter((c) => c.statut === "Offre acceptée");
  const propositions = liste.filter((c) =>
    ["Proposition", "Offre acceptée"].includes(c.statut)
  );

  const assez = envoyees.length >= SEUIL_MINI;

  let delaiMoyen: number | null = null;
  if (historique && historique.length > 0) {
    const delais: number[] = [];
    for (const c of liste) {
      if (!c.date_envoi) continue;
      const premiereReponse = historique
        .filter(
          (h) => h.candidature_id === c.id && STATUTS_REPONSE.includes(h.nouveau_statut)
        )
        .sort((a, b) => (a.date_evenement > b.date_evenement ? 1 : -1))[0];

      if (premiereReponse) {
        const jours = Math.round(
          (new Date(premiereReponse.date_evenement).getTime() -
            new Date(c.date_envoi).getTime()) /
            86400000
        );
        if (jours >= 0) delais.push(jours);
      }
    }
    if (delais.length >= 3) {
      delaiMoyen = Math.round(delais.reduce((a, b) => a + b, 0) / delais.length);
    }
  }

  const kpis = [
    { label: "Envoyées", valeur: envoyees.length },
    {
      label: "Taux de réponse",
      valeur: assez ? pourcent(idsAvecReponse.size, envoyees.length) : "—",
      note: !assez ? `${SEUIL_MINI} envois min.` : undefined,
    },
    {
      label: "Taux d'entretien",
      valeur: assez ? pourcent(idsAvecEntretien.size, envoyees.length) : "—",
      note: !assez ? `${SEUIL_MINI} envois min.` : undefined,
    },
    {
      label: "Délai de réponse",
      valeur: delaiMoyen !== null ? `${delaiMoyen} j` : "—",
      note: delaiMoyen === null ? "3 réponses min." : undefined,
    },
  ];

  const mapSource = new Map<string, Ligne>();
  for (const c of liste) {
    const cle = c.source ?? "Non renseigné";
    if (!mapSource.has(cle)) {
      mapSource.set(cle, { cle, total: 0, reponses: 0, entretiens: 0 });
    }
    const l = mapSource.get(cle)!;
    l.total++;
    if (idsAvecReponse.has(c.id)) l.reponses++;
    if (idsAvecEntretien.has(c.id)) l.entretiens++;
  }

  const parSource = [...mapSource.values()]
    .sort((a, b) => b.total - a.total)
    .filter((l) => l.total >= 3);
      const MOIS_COURTS = [
    "janv.", "févr.", "mars", "avr.", "mai", "juin",
    "juil.", "août", "sept.", "oct.", "nov.", "déc.",
  ];

  const serie: { label: string; envois: number; reponses: number }[] = [];
  const maintenant = new Date();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
    const fin = new Date(d.getFullYear(), d.getMonth() + 1, 1);

    const envois = liste.filter((c) => {
      if (!c.date_envoi) return false;
      const envoi = new Date(c.date_envoi);
      return envoi >= d && envoi < fin;
    }).length;

    const reponses = (historique ?? []).filter((h) => {
      if (!STATUTS_REPONSE.includes(h.nouveau_statut)) return false;
      const date = new Date(h.date_evenement);
      return date >= d && date < fin;
    }).length;

    serie.push({
      label: `${MOIS_COURTS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
      envois,
      reponses,
    });
  }
    return (
    <div>
      <h1 className="text-2xl font-bold md:text-3xl">Statistiques</h1>
      <p className="mt-1 text-sm text-gray-600">
        {liste.length} candidature{liste.length > 1 ? "s" : ""} enregistrée
        {liste.length > 1 ? "s" : ""}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-lg border p-4">
            <p className="text-xs text-gray-500">{k.label}</p>
            <p className="mt-1 text-2xl font-bold md:text-3xl">{k.valeur}</p>
            {k.note && <p className="mt-1 text-xs text-gray-400">{k.note}</p>}
          </div>
        ))}
      </div>

      {acceptees.length > 0 && (
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
          {acceptees.length} offre{acceptees.length > 1 ? "s" : ""} acceptée
          {acceptees.length > 1 ? "s" : ""}
        </div>
      )}

      {propositions.length > acceptees.length && (
        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          {propositions.length - acceptees.length} proposition
          {propositions.length - acceptees.length > 1 ? "s" : ""} en attente de
          décision
        </div>
      )}

      <section className="mt-6 rounded-lg border">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold">Par source</h2>
          <p className="text-xs text-gray-500">
            Quelles plateformes vous donnent le plus de retours
          </p>
        </div>

        {parSource.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-400">
            Pas encore assez de données. Trois candidatures minimum par source.
          </p>
        ) : (
          <ul className="divide-y">
            {parSource.map((l) => (
              <li key={l.cle} className="px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate font-medium">{l.cle}</span>
                  <span className="shrink-0 text-xs text-gray-500">
                    {l.total} candidature{l.total > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="mt-1 flex gap-4 text-xs">
                  <span className="text-gray-500">
                    Réponses{" "}
                    <strong className="text-gray-900">
                      {pourcent(l.reponses, l.total)}
                    </strong>
                  </span>
                  <span className="text-gray-500">
                    Entretiens{" "}
                    <strong className="text-violet-700">
                      {pourcent(l.entretiens, l.total)}
                    </strong>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-4">
        <Courbe serie={serie} />
      </div>
    </div>
  );
}
