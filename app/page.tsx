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
  "Refus": "bg-red-100 text-red-700",
};

export default async function Dashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: candidatures } = await supabase
    .from("candidatures")
    .select("*")
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
    ["Entretien RH", "Proposition", "Refus"].includes(c.statut)
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
    { label: "En attente", valeur: enAttente.length },
    { label: "Entretiens", valeur: entretiens.length },
    {
      label: "Taux de réponse",
      valeur: tauxReponse !== null ? `${tauxReponse} %` : "—",
      note: tauxReponse === null ? "5 envois minimum" : undefined,
    },
  ];
    return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="mt-2 text-gray-600">Vue d&apos;ensemble de votre recherche</p>
        </div>
        <Link href="/nouvelle" className="rounded bg-black px-4 py-2 text-sm text-white">
          + Nouvelle candidature
        </Link>
      </div>

      {(aEnvoyer.length > 0 || relances.length > 0) && (
        <div className="mt-6 flex flex-wrap gap-3 rounded-lg border border-orange-200 bg-orange-50 px-5 py-4 text-sm">
          <span className="font-medium text-orange-900">À faire :</span>
          {aEnvoyer.length > 0 && (
            <span className="text-orange-800">
              {aEnvoyer.length} candidature{aEnvoyer.length > 1 ? "s" : ""} à envoyer
            </span>
          )}
          {aEnvoyer.length > 0 && relances.length > 0 && (
            <span className="text-orange-300">·</span>
          )}
          {relances.length > 0 && (
            <span className="text-orange-800">
              {relances.length} relance{relances.length > 1 ? "s" : ""} à faire
            </span>
          )}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-lg border p-5">
            <p className="text-sm text-gray-500">{k.label}</p>
            <p className="mt-2 text-3xl font-bold">{k.valeur}</p>
            {k.note && <p className="mt-1 text-xs text-gray-400">{k.note}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="font-semibold">Relances à faire</h2>
            <span className="text-xs text-gray-500">sans réponse depuis {SEUIL_RELANCE} jours</span>
          </div>
          {relances.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400">Rien à relancer.</p>
          ) : (
            <ul className="divide-y">
              {relances.slice(0, 6).map((c) => (
                <li key={c.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <Link href={`/candidatures/${c.id}`} className="text-sm font-medium hover:underline">
                      {c.entreprise}
                    </Link>
                    <p className="text-xs text-gray-500">{c.poste}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-orange-700">
                    {joursDepuis(c.date_envoi)} jours
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="font-semibold">À envoyer</h2>
            <Link href="/candidatures?statut=À+envoyer" className="text-xs text-gray-500 hover:underline">
              Tout voir
            </Link>
          </div>
          {aEnvoyer.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400">Aucune candidature en attente d&apos;envoi.</p>
          ) : (
            <ul className="divide-y">
              {aEnvoyer.slice(0, 6).map((c) => (
                <li key={c.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <Link href={`/candidatures/${c.id}`} className="text-sm font-medium hover:underline">
                      {c.entreprise}
                    </Link>
                    <p className="text-xs text-gray-500">{c.poste}</p>
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
      </div>
            <section className="mt-6 rounded-lg border">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="font-semibold">Activité récente</h2>
          <Link href="/candidatures" className="text-xs text-gray-500 hover:underline">
            Toutes les candidatures
          </Link>
        </div>
        {!activite || activite.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400">Aucune activité.</p>
        ) : (
          <ul className="divide-y">
            {activite.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      couleurs[a.nouveau_statut] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {a.nouveau_statut}
                  </span>
                  <div>
                    <Link
                      href={`/candidatures/${a.candidature_id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {a.candidatures?.entreprise ?? "—"}
                    </Link>
                    <p className="text-xs text-gray-500">{a.candidatures?.poste ?? ""}</p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-gray-500">
                  {formatDate(a.date_evenement)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
