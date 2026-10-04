import { createClient } from "../supabase-server";
import { redirect } from "next/navigation";
import BoutonImprimer from "./BoutonImprimer";

export const dynamic = "force-dynamic";

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR");
}

function formatDateHeure(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function Rapport() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: dataCandidatures } = await supabase
    .from("candidatures")
    .select("*")
    .order("date_envoi", { ascending: false, nullsFirst: false });

  const { data: dataEntretiens } = await supabase
    .from("entretiens")
    .select("*, candidatures(entreprise, poste)")
    .order("date_entretien", { ascending: false });

  const candidatures = dataCandidatures ?? [];
  const entretiens = dataEntretiens ?? [];

  const maintenant = Date.now();
  const entretiensAVenir = entretiens.filter(
    (e) => e.date_entretien && new Date(e.date_entretien).getTime() >= maintenant
  );
  const entretiensPasses = entretiens.filter(
    (e) => e.date_entretien && new Date(e.date_entretien).getTime() < maintenant
  );

  const dates = candidatures
    .map((c) => c.date_envoi)
    .filter(Boolean)
    .sort();
  const periode =
    dates.length > 0
      ? `du ${formatDate(dates[0])} au ${formatDate(dates[dates.length - 1])}`
      : "";
        return (
    <div className="mx-auto max-w-4xl px-6 py-8 print:px-0 print:py-0">
      <div className="print:hidden">
        <BoutonImprimer />
      </div>

      <header className="mt-6 border-b pb-6 print:mt-0">
        <h1 className="text-3xl font-bold">Rapport de candidatures</h1>
        <p className="mt-2 text-sm text-gray-600">{user.email}</p>
        {periode && <p className="text-sm text-gray-600">Période {periode}</p>}
        <p className="mt-1 text-xs text-gray-400">
          Édité le {new Date().toLocaleDateString("fr-FR")} · Joply
        </p>
      </header>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">
          Candidatures ({candidatures.length})
        </h2>

        {candidatures.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">Aucune candidature.</p>
        ) : (
          <table className="mt-4 w-full border-collapse text-sm">
            <thead>
              <tr className="border-y bg-gray-50 text-left text-xs uppercase text-gray-500 print:bg-transparent">
                <th className="py-2 pr-3 font-medium">Entreprise</th>
                <th className="py-2 pr-3 font-medium">Poste</th>
                <th className="py-2 pr-3 font-medium">Contrat</th>
                <th className="py-2 pr-3 font-medium">Envoyée le</th>
                <th className="py-2 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {candidatures.map((c) => (
                <tr key={c.id} className="border-b align-top">
                  <td className="py-2 pr-3 font-medium">{c.entreprise}</td>
                  <td className="py-2 pr-3">{c.poste}</td>
                  <td className="py-2 pr-3 text-gray-600">
                    {c.type_contrat ?? "—"}
                  </td>
                  <td className="py-2 pr-3 text-gray-600">
                    {formatDate(c.date_envoi)}
                  </td>
                  <td className="py-2">{c.statut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
            {entretiensAVenir.length > 0 && (
        <section className="mt-10 break-inside-avoid">
          <h2 className="text-lg font-semibold">
            Entretiens à venir ({entretiensAVenir.length})
          </h2>
          <table className="mt-4 w-full border-collapse text-sm">
            <thead>
              <tr className="border-y bg-gray-50 text-left text-xs uppercase text-gray-500 print:bg-transparent">
                <th className="py-2 pr-3 font-medium">Date</th>
                <th className="py-2 pr-3 font-medium">Entreprise</th>
                <th className="py-2 pr-3 font-medium">Étape</th>
                <th className="py-2 font-medium">Interlocuteur</th>
              </tr>
            </thead>
            <tbody>
              {entretiensAVenir.map((e) => (
                <tr key={e.id} className="border-b align-top">
                  <td className="py-2 pr-3">{formatDateHeure(e.date_entretien)}</td>
                  <td className="py-2 pr-3 font-medium">
                    {e.candidatures?.entreprise ?? "—"}
                  </td>
                  <td className="py-2 pr-3 text-gray-600">{e.etape}</td>
                  <td className="py-2 text-gray-600">{e.interlocuteur ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {entretiensPasses.length > 0 && (
        <section className="mt-10 break-inside-avoid">
          <h2 className="text-lg font-semibold">
            Entretiens passés ({entretiensPasses.length})
          </h2>
          <table className="mt-4 w-full border-collapse text-sm">
            <thead>
              <tr className="border-y bg-gray-50 text-left text-xs uppercase text-gray-500 print:bg-transparent">
                <th className="py-2 pr-3 font-medium">Date</th>
                <th className="py-2 pr-3 font-medium">Entreprise</th>
                <th className="py-2 pr-3 font-medium">Étape</th>
                <th className="py-2 font-medium">Interlocuteur</th>
              </tr>
            </thead>
            <tbody>
              {entretiensPasses.map((e) => (
                <tr key={e.id} className="border-b align-top">
                  <td className="py-2 pr-3">{formatDateHeure(e.date_entretien)}</td>
                  <td className="py-2 pr-3 font-medium">
                    {e.candidatures?.entreprise ?? "—"}
                  </td>
                  <td className="py-2 pr-3 text-gray-600">{e.etape}</td>
                  <td className="py-2 text-gray-600">{e.interlocuteur ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <footer className="mt-12 border-t pt-4 text-xs text-gray-400">
        Document généré par Joply — joply.fr
      </footer>
    </div>
  );
}
