import { createClient } from "../supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Calendrier, { EntretienAgenda, CandidatureOption } from "./Calendrier";

export const dynamic = "force-dynamic";

function formatDateHeure(d: string) {
  return new Date(d).toLocaleString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function joursAvant(d: string) {
  const diff = new Date(d).getTime() - Date.now();
  const jours = Math.ceil(diff / 86400000);
  if (jours <= 0) return "Aujourd'hui";
  if (jours === 1) return "Demain";
  return `Dans ${jours} jours`;
}

export default async function Agenda() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: dataEntretiens } = await supabase
    .from("entretiens")
    .select("*, candidatures(entreprise, poste)")
    .order("date_entretien", { ascending: true });

  const { data: dataCandidatures } = await supabase
    .from("candidatures")
    .select("id, entreprise, poste")
    .order("entreprise", { ascending: true });

  const entretiens = (dataEntretiens ?? []) as EntretienAgenda[];
  const candidatures = (dataCandidatures ?? []) as CandidatureOption[];

  const maintenant = Date.now();
  const aVenir = entretiens
    .filter((e) => e.date_entretien && new Date(e.date_entretien).getTime() >= maintenant)
    .slice(0, 3);

  return (
    <div>
      <h1 className="text-2xl font-bold md:text-3xl">Agenda</h1>
      <p className="mt-1 text-sm text-gray-600">
        {aVenir.length === 0
          ? "Aucun entretien à venir"
          : `${aVenir.length} entretien${aVenir.length > 1 ? "s" : ""} à venir`}
      </p>

      {aVenir.length > 0 && (
        <section className="mt-6 rounded-lg border border-violet-200 bg-violet-50">
          <h2 className="border-b border-violet-200 px-4 py-2 text-sm font-semibold text-violet-900">
            Prochains entretiens
          </h2>
          <ul className="divide-y divide-violet-100">
            {aVenir.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/candidatures/${e.candidature_id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {e.candidatures?.entreprise ?? "—"}
                  </Link>
                  <p className="text-xs text-gray-600">
                    {e.etape}
                    {e.interlocuteur && ` · ${e.interlocuteur}`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-medium">
                    {formatDateHeure(e.date_entretien!)}
                  </p>
                  <p className="text-xs text-violet-700">
                    {joursAvant(e.date_entretien!)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6">
        <Calendrier entretiens={entretiens} candidatures={candidatures} />
      </div>
    </div>
  );
}
