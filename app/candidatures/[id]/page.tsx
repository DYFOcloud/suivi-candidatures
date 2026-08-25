import { createClient } from "../../supabase-server";
import { redirect, notFound } from "next/navigation";
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

export default async function FicheCandidature({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: c } = await supabase
    .from("candidatures")
    .select("*")
    .eq("id", id)
    .single();

  if (!c) notFound();

  const champs = [
    { label: "Entreprise", valeur: c.entreprise },
    { label: "Poste", valeur: c.poste },
    { label: "Lieu", valeur: c.lieu ?? "—" },
    { label: "Date d'envoi", valeur: formatDate(c.date_envoi) },
    { label: "Salaire", valeur: formatSalaire(c.salaire_min, c.salaire_max) },
    { label: "Notes", valeur: c.notes || "—" },
  ];

  const badge = couleurs[c.statut] ?? "bg-gray-100 text-gray-700";

  return (
    <div>
      <Link href="/candidatures" className="text-sm text-gray-500 hover:underline">
        Retour aux candidatures
      </Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{c.poste}</h1>
          <p className="mt-1 text-lg text-gray-600">{c.entreprise}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${badge}`}>
          {c.statut}
        </span>
      </div>

      <section className="mt-8 max-w-2xl rounded-lg border">
        <h2 className="border-b px-5 py-3 font-semibold">Détails</h2>
        <dl className="divide-y">
          {champs.map((champ) => (
            <div key={champ.label} className="flex px-5 py-3 text-sm">
              <dt className="w-40 shrink-0 text-gray-500">{champ.label}</dt>
              <dd className="font-medium">{champ.valeur}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
