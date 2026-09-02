import { createClient } from "../supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

type EntretienAvecCandidature = {
  id: string;
  candidature_id: string;
  etape: string;
  date_entretien: string | null;
  interlocuteur: string | null;
  format: string | null;
  candidatures: { entreprise: string; poste: string } | null;
};

function formatDateHeure(d: string) {
  return new Date(d).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function joursAvant(d: string) {
  const diff = new Date(d).getTime() - Date.now();
  const jours = Math.ceil(diff / 86400000);
  if (jours === 0) return "Aujourd'hui";
  if (jours === 1) return "Demain";
  if (jours < 0) return null;
  return `Dans ${jours} jours`;
}

export default async function Agenda() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("entretiens")
    .select("*, candidatures(entreprise, poste)")
    .order("date_entretien", { ascending: true });

  const entretiens = (data ?? []) as EntretienAvecCandidature[];
  const maintenant = Date.now();

  const aVenir = entretiens
    .filter((e) => e.date_entretien && new Date(e.date_entretien).getTime() >= maintenant)
    .sort((a, b) => (a.date_entretien! > b.date_entretien! ? 1 : -1));

  const passes = entretiens
    .filter((e) => e.date_entretien && new Date(e.date_entretien).getTime() < maintenant)
    .sort((a, b) => (a.date_entretien! < b.date_entretien! ? 1 : -1));

  const sansDate = entretiens.filter((e) => !e.date_entretien);

  const dansSeptJours = aVenir.filter(
    (e) => new Date(e.date_entretien!).getTime() < maintenant + 7 * 86400000
  );
    return (
    <div>
      <div>
        <h1 className="text-3xl font-bold">Agenda</h1>
        <p className="mt-2 text-gray-600">
          {aVenir.length === 0
            ? "Aucun entretien à venir."
            : `${aVenir.length} entretien${aVenir.length > 1 ? "s" : ""} à venir`}
          {dansSeptJours.length > 0 && ` · ${dansSeptJours.length} cette semaine`}
        </p>
      </div>

      <section className="mt-8 rounded-lg border">
        <h2 className="border-b px-5 py-3 font-semibold">À venir</h2>
        {aVenir.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400">
            Aucun entretien planifié. Ajoutez-en depuis une fiche candidature.
          </p>
        ) : (
          <ul className="divide-y">
            {aVenir.map((e) => {
              const proche = new Date(e.date_entretien!).getTime() < maintenant + 7 * 86400000;
              return (
                <li key={e.id} className={`px-5 py-4 ${proche ? "bg-violet-50" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/candidatures/${e.candidature_id}`}
                        className="font-medium hover:underline"
                      >
                        {e.candidatures?.entreprise ?? "—"}
                      </Link>
                      <p className="text-sm text-gray-600">{e.candidatures?.poste ?? ""}</p>
                      <p className="mt-1 text-sm text-gray-700">
                        {e.etape}
                        {e.interlocuteur && ` · ${e.interlocuteur}`}
                        {e.format && ` · ${e.format}`}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-medium">{formatDateHeure(e.date_entretien!)}</p>
                      {joursAvant(e.date_entretien!) && (
                        <p className={`text-xs ${proche ? "font-medium text-violet-700" : "text-gray-500"}`}>
                          {joursAvant(e.date_entretien!)}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
            {sansDate.length > 0 && (
        <section className="mt-6 rounded-lg border">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="font-semibold">À planifier</h2>
            <span className="text-xs text-gray-500">date non renseignée</span>
          </div>
          <ul className="divide-y">
            {sansDate.map((e) => (
              <li key={e.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <Link
                    href={`/candidatures/${e.candidature_id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {e.candidatures?.entreprise ?? "—"}
                  </Link>
                  <p className="text-xs text-gray-500">{e.candidatures?.poste ?? ""}</p>
                </div>
                <span className="shrink-0 text-sm text-gray-600">{e.etape}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {passes.length > 0 && (
        <section className="mt-6 rounded-lg border">
          <h2 className="border-b px-5 py-3 font-semibold text-gray-600">Entretiens passés</h2>
          <ul className="divide-y">
            {passes.slice(0, 10).map((e) => (
              <li key={e.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/candidatures/${e.candidature_id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {e.candidatures?.entreprise ?? "—"}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {e.etape}
                    {e.interlocuteur && ` · ${e.interlocuteur}`}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-gray-500">
                  {new Date(e.date_entretien!).toLocaleDateString("fr-FR")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
