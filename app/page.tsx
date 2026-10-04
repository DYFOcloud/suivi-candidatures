import { createClient } from "./supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

const SEUIL_RELANCE = 21;

function joursDepuis(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  return Math.floor(diff / 86400000);
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

const couleurs: Record<string, string> = {
  "À envoyer": "bg-orange-100 text-orange-700",
  "Envoyée": "bg-blue-100 text-blue-700",
  "Entretien RH": "bg-violet-100 text-violet-700",
  "Proposition": "bg-green-100 text-green-700",
  "Offre acceptée": "bg-emerald-600 text-white",
  "Refus": "bg-red-100 text-red-700",
};

export default async function Dashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: candidatures } = await supabase
    .from("candidatures")
    .select("*")
    .or("archivee.is.null,archivee.eq.false")
    .order("created_at", { ascending: false });

  const { data: activite } = await supabase
    .from("historique_statuts")
    .select("*, candidatures(entreprise, poste)")
    .order("date_evenement", { ascending: false })
    .limit(5);

  const liste = candidatures ?? [];

  const aEnvoyer = liste.filter((c) => c.statut === "À envoyer");
  const envoyees = liste.filter((c) => c.statut !== "À envoyer");
  const enAttente = liste.filter((c) => c.statut === "Envoyée");
  const entretiens = liste.filter((c) => c.statut === "Entretien RH");
  const reponses = liste.filter((c) =>
    ["Entretien RH", "Proposition", "Offre acceptée", "Refus"].includes(c.statut)
  );

  const relances = enAttente
    .filter((c) => c.date_envoi && joursDepuis(c.date_envoi) >= SEUIL_RELANCE)
    .sort((a, b) => (a.date_envoi > b.date_envoi ? 1 : -1));

  const assezDeDonnees = envoyees.length >= 5;
  const tauxReponse = assezDeDonnees
    ? Math.round((reponses.length / envoyees.length) * 100)
    : null;

  const kpis = [
    { label: "Candidatures", valeur: liste.length },
    { label: "Entretiens", valeur: entretiens.length },
    {
      label: "Taux de réponse",
      valeur: tauxReponse !== null ? `${tauxReponse} %` : "—",
      note: tauxReponse === null ? "5 envois minimum" : undefined,
    },
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
            {k.note && <p className="mt-1 text-xs text-gray-400">{k.note}</p>}
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border">
          <div className="flex items-center justify-between border-b px-4 py-3">
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
            <ul className="divide-y">
              {aEnvoyer.slice(0, 8).map((c) => (
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
                      publiée le {formatDate(c.date_publication)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-4">
          <section className="rounded-lg border">
            <div className="flex items-center justify-between border-b px-3 py-2">
              <h2 className="text-sm font-semibold">Relances à faire</h2>
              <span className="text-[11px] text-gray-400">+{SEUIL_RELANCE} jours</span>
            </div>
            {relances.length === 0 ? (
              <p className="px-3 py-3 text-xs text-gray-400">Rien à relancer.</p>
            ) : (
              <ul className="divide-y">
                {relances.slice(0, 5).map((c) => (
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

          <section className="rounded-lg border">
            <div className="flex items-center justify-between border-b px-3 py-2">
              <h2 className="text-sm font-semibold">Activité récente</h2>
              <Link href="/candidatures" className="text-[11px] text-gray-400 hover:underline">
                Tout voir
              </Link>
            </div>
            {!activite || activite.length === 0 ? (
              <p className="px-3 py-3 text-xs text-gray-400">Aucune activité.</p>
            ) : (
              <ul className="divide-y">
                {activite.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2 px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          couleurs[a.nouveau_statut] ?? "bg-gray-100 text-gray-700"
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
