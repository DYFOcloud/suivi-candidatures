import { createClient } from "../../supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Actions from "./Actions";
import Documents from "./Documents";
import Historique from "./Historique";
import Correspondance from "./Correspondance";

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR");
}

function formatSalaire(min: number | null, max: number | null) {
  if (!min && !max) return "—";
  if (min && max) return `${min / 1000}–${max / 1000} k€`;
  return `${(min ?? max)! / 1000} k€`;
}

function LienOffre({ url }: { url: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
      Ouvrir l&apos;annonce
    </a>
  );
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

  const { data: historique } = await supabase
    .from("historique_statuts")
    .select("*")
    .eq("candidature_id", id)
    .order("date_evenement", { ascending: false });

  const champs = [
    { label: "Entreprise", valeur: c.entreprise },
    { label: "Poste", valeur: c.poste },
    { label: "Lieu", valeur: c.lieu ?? "—" },
    { label: "Type de contrat", valeur: c.type_contrat ?? "—" },
    { label: "Référence", valeur: c.reference ?? "—" },
    { label: "Offre publiée le", valeur: formatDate(c.date_publication) },
    { label: "Candidature envoyée le", valeur: formatDate(c.date_envoi) },
    { label: "Salaire", valeur: formatSalaire(c.salaire_min, c.salaire_max) },
  ];
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
        <div className="flex items-center gap-3">
          <Link
            href={`/candidatures/${c.id}/modifier`}
            className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Modifier
          </Link>
          <Actions id={c.id} statutInitial={c.statut} />
        </div>
      </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg border">
            <h2 className="border-b px-5 py-3 font-semibold">Détails</h2>
            <dl className="divide-y">
              {champs.map((champ) => (
                <div key={champ.label} className="flex px-5 py-3 text-sm">
                  <dt className="w-48 shrink-0 text-gray-500">{champ.label}</dt>
                  <dd className="font-medium">{champ.valeur}</dd>
                </div>
              ))}
              <div className="flex px-5 py-3 text-sm">
                <dt className="w-48 shrink-0 text-gray-500">Lien</dt>
                <dd className="font-medium">
                  {c.url_offre ? <LienOffre url={c.url_offre} /> : "—"}
                </dd>
              </div>
            </dl>
          </section>

          <Correspondance
            id={c.id}
            analyseInitiale={c.analyse_json}
            cvPresent={!!c.cv_path}
            offrePresente={!!c.offre_texte}
          />

          <section className="rounded-lg border">
            <h2 className="border-b px-5 py-3 font-semibold">Notes</h2>
            <p className="whitespace-pre-wrap px-5 py-4 text-sm text-gray-700">
              {c.notes || "Aucune note."}
            </p>
          </section>
        </div>

        <div className="space-y-6">
          <Documents id={c.id} cvPath={c.cv_path} lmPath={c.lm_path} />
          <Historique evenements={historique ?? []} />
        </div>
      </div>
    </div>
  );
}
