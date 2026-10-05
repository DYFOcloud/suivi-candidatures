import { createClient } from "./supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { COULEURS_STATUT, STATUTS_REPONSE } from "./constantes";

export const dynamic = "force-dynamic";

const SEUIL_RELANCE = 21;

function joursDepuis(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default async function Dashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: candidatures } = await supabase
    .from("candidatures")
    .select("*")
    .or("archivee.is.null,archivee.eq.false")
    .order("created_at", { ascending: false });

  const { data: toutes } = await supabase
    .from("candidatures")
    .select("id, statut, date_envoi");

  const { data: historique } = await supabase
    .from("historique_statuts")
    .select("*, candidatures(entreprise, poste)")
    .order("date_evenement", { ascending: false });

  const { data: entretiens } = await supabase
    .from("entretiens")
    .select("candidature_id");

  const liste = candidatures ?? [];
  const toutesCandidatures = toutes ?? [];

  const aEnvoyer = liste.filter((c) => c.statut === "À envoyer");
  const enAttente = liste.filter((c) => c.statut === "Envoyée");

  const envoyees = toutesCandidatures.filter((c) => c.statut !== "À envoyer");

  const idsAvecEntretien = new Set<string>();
  for (const e of entretiens ?? []) {
    idsAvecEntretien.add(e.candidature_id);
  }
  for (const h of historique ?? []) {
    if (STATUTS_REPONSE.includes(h.nouveau_statut) && h.nouveau_statut !== "Refus") {
      idsAvecEntretien.add(h.candidature_id);
    }
  }

  const relances = enAttente
    .filter((c) => c.date_envoi && joursDepuis(c.date_envoi) >= SEUIL_RELANCE)
    .sort((a, b) => (a.date_envoi > b.date_envoi ? 1 : -1));

  const activite = historique ?? [];

  const kpis = [
    { label: "Candidatures envoyées", valeur: envoyees.length },
    { label: "En attente de réponse", valeur: enAttente.length },
    { label: "Entretiens obtenus", valeur: idsAvecEntretien.size },
  ];
    return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Tableau de bord</h1>
          <p className="mt-1 text-sm text-gray-600">
            Vue d&apos;ensemble de votre recherche
          </p>
        </div>
        <Link href="/nouvelle" className="rounded bg-black px-4 py-2 text-sm text-white">
          + Nouvelle
        </Link>
      </div>

      {(aEnvoyer.length > 0 || relances.length > 0) && (
        <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm md:hidden">
          <span className="font-medium text-orange-900">À faire :</span>
          {aEnvoyer.length > 0 && (
            <span className="text-orange-800">{aEnvoyer.length} à envoyer</span>
          )}
          {aEnvoyer.length > 0 && relances.length > 0 && (
            <span className="text-orange-300">·</span>
          )}
          {relances.length > 0 && (
            <span className="text-orange-800">
              {relances.length} relance{relances.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      <div className="mt-5 grid grid-cols-3 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-lg border p-4">
            <p className="text-xs text-gray-500">{k.label}</p>
            <p className="mt-1 text-2xl font-bold md:text-3xl">{k.valeur}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:h-[420px] lg:grid-cols-2">
        <section className="flex flex-col overflow-hidden rounded-lg border">
          <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
            <h2 className="font-semibold">À envoyer</h2>
            <Link
              href="/candidatures?statut=À+envoyer"
              className="text-xs text-gray-500 hover:underline"
            >
              Tout voir
            </Link>
          </div>
          {aEnvoyer.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-400">
              Aucune candidature en attente d&apos;envoi.
            </p>
          ) : (
            <ul className="divide-y overflow-y-auto">
              {aEnvoyer.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/candidatures/${c.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {c.entreprise}
                    </Link>
                    <p className="truncate text-xs text-gray-500">{c.poste}</p>
                  </div>
                  {c.date_publication && (
                    <span className="shrink-0 text-xs text-gray-500">
                      {formatDate(c.date_publication)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid gap-4 lg:h-[420px] lg:grid-rows-2">
          <section className="flex flex-col overflow-hidden rounded-lg border">
            <div className="flex shrink-0 items-center justify-between border-b px-3 py-2">
              <h2 className="text-sm font-semibold">Relances à faire</h2>
              <span className="text-[11px] text-gray-400">+{SEUIL_RELANCE} jours</span>
            </div>
            {relances.length === 0 ? (
              <p className="px-3 py-3 text-xs text-gray-400">Rien à relancer.</p>
            ) : (
              <ul className="divide-y overflow-y-auto">
                {relances.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2 px-3 py-2">
                    <div className="min-w-0">
                      <Link
                        href={`/candidatures/${c.id}`}
                        className="text-xs font-medium hover:underline"
                      >
                        {c.entreprise}
                      </Link>
                      <p className="truncate text-[11px] text-gray-500">{c.poste}</p>
                    </div>
                    <span className="shrink-0 text-[11px] font-medium text-orange-700">
                      {joursDepuis(c.date_envoi)} j
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="flex flex-col overflow-hidden rounded-lg border">
            <div className="flex shrink-0 items-center justify-between border-b px-3 py-2">
              <h2 className="text-sm font-semibold">Activité récente</h2>
              <Link href="/candidatures" className="text-[11px] text-gray-400 hover:underline">
                Tout voir
              </Link>
            </div>
            {activite.length === 0 ? (
              <p className="px-3 py-3 text-xs text-gray-400">Aucune activité.</p>
            ) : (
              <ul className="divide-y overflow-y-auto">
                {activite.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2 px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          COULEURS_STATUT[a.nouveau_statut] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {a.nouveau_statut}
                      </span>
                      <Link
                        href={`/candidatures/${a.candidature_id}`}
                        className="truncate text-xs font-medium hover:underline"
                      >
                        {a.candidatures?.entreprise ?? "—"}
                      </Link>
                    </div>
                    <span className="shrink-0 text-[11px] text-gray-400">
                      {formatDate(a.date_evenement)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
