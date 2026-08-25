import { createClient } from "../supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

const couleurs: Record<string, string> = {
  "À envoyer": "bg-gray-100 text-gray-700",
  "Envoyée": "bg-blue-100 text-blue-700",
  "Entretien RH": "bg-amber-100 text-amber-700",
  "Proposition": "bg-green-100 text-green-700",
  "Refus": "bg-red-100 text-red-700",
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR");
}

function formatSalaire(min: number | null, max: number | null) {
  if (!min && !max) return "—";
  if (min && max) return `${min / 1000}–${max / 1000} k€`;
  return `${(min ?? max)! / 1000} k€`;
}

export default async function Candidatures() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: candidatures, error } = await supabase
    .from("candidatures")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-red-600">Erreur : {error.message}</p>;
  }

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Candidatures</h1>
          <p className="mt-2 text-gray-600">
            {candidatures?.length ?? 0} au total
          </p>
        </div>
        <Link
          href="/nouvelle"
          className="rounded bg-black px-4 py-2 text-sm text-white"
        >
          + Nouvelle candidature
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Entreprise</th>
              <th className="px-4 py-3">Poste</th>
              <th className="px-4 py-3">Lieu</th>
              <th className="px-4 py-3">Envoyée le</th>
              <th className="px-4 py-3">Salaire</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {candidatures?.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">
                  <Link
                    href={`/candidatures/${c.id}`}
                    className="hover:underline"
                  >
                    {c.entreprise}
                  </Link>
                </td>
                <td className="px-4 py-3">{c.poste}</td>
                <td className="px-4 py-3 text-gray-600">{c.lieu ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(c.date_envoi)}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatSalaire(c.salaire_min, c.salaire_max)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                      couleurs[c.statut] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {c.statut}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
