import { createClient } from "./supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Dashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: candidatures } = await supabase
    .from("candidatures")
    .select("*")
    .order("created_at", { ascending: false });

  const liste = candidatures ?? [];

  const total = liste.length;
  const envoyees = liste.filter((c) => c.statut !== "À envoyer").length;
  const enCours = liste.filter((c) =>
    ["Entretien RH", "Proposition"].includes(c.statut)
  ).length;
  const refus = liste.filter((c) => c.statut === "Refus").length;

  const tauxReponse =
    envoyees > 0 ? Math.round(((enCours + refus) / envoyees) * 100) : 0;

  const stats = [
    { label: "Candidatures", valeur: total },
    { label: "Envoyées", valeur: envoyees },
    { label: "En cours", valeur: enCours },
    { label: "Taux de réponse", valeur: `${tauxReponse} %` },
  ];

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="mt-2 text-gray-600">Vue d&apos;ensemble de vos recherches</p>
        </div>
        <Link
          href="/nouvelle"
          className="rounded bg-black px-4 py-2 text-sm text-white"
        >
          + Nouvelle candidature
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border p-5">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="mt-2 text-3xl font-bold">{s.valeur}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="font-semibold">Dernières candidatures</h2>
          <Link href="/candidatures" className="text-sm text-gray-600 hover:underline">
            Tout voir →
          </Link>
        </div>

        {liste.length === 0 ? (
          <p className="p-5 text-sm text-gray-500">
            Aucune candidature pour le moment.
          </p>
        ) : (
          <ul className="divide-y">
            {liste.slice(0, 5).map((c) => (
              <li key={c.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium">{c.poste}</p>
                  <p className="text-xs text-gray-500">{c.entreprise}</p>
                </div>
                <span className="text-xs text-gray-500">{c.statut}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
