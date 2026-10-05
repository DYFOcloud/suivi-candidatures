import { createClient } from "../../supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Actions from "./Actions";
import Archiver from "./Archiver";
import Documents from "./Documents";
import Historique from "./Historique";
import Correspondance from "./Correspondance";
import Entretiens from "./Entretiens";
import FicheEntreprise from "./FicheEntreprise";

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

  const { data: profil } = await supabase
    .from("profils")
    .select("cv_reference_path")
    .eq("id", user.id)
    .maybeSingle();

  const { data: historique } = await supabase
    .from("historique_statuts")
    .select("*")
    .eq("candidature_id", id)
    .order("date_evenement", { ascending: false });

  const { data: entretiens } = await supabase
    .from("entretiens")
    .select("*")
    .eq("candidature_id", id)
    .order("date_entretien", { ascending: true, nullsFirst: false });

  const champs = [
    { label: "Entreprise", valeur: c.entreprise },
    { label: "Poste", valeur: c.poste },
    { label: "Lieu", valeur: c.lieu ?? "—" },
    { label: "Type de contrat", valeur: c.type_contrat ?? "—" },
    { label: "Source", valeur: c.source ?? "—" },
    { label: "Référence", valeur: c.reference ?? "—" },
    { label: "Offre publiée le", valeur: formatDate(c.date_publication) },
    { label: "Candidature envoyée le", valeur: formatDate(c.date_envoi) },
    { label: "Salaire", valeur: formatSalaire(c.salaire_min, c.salaire_max) },
  ];
    const blocDetails = (
    <section className="rounded-lg border">
      <h2 className="border-b px-4 py-3 font-semibold">Détails</h2>
      <dl className="divide-y">
        {champs.map((champ) => (
          <div key={champ.label} className="px-4 py-3 text-sm md:flex md:gap-4">
            <dt className="text-xs text-gray-500 md:w-48 md:shrink-0 md:text-sm">
              {champ.label}
            </dt>
            <dd className="mt-0.5 font-medium md:mt-0">{champ.valeur}</dd>
          </div>
        ))}
        <div className="px-4 py-3 text-sm md:flex md:gap-4">
          <dt className="text-xs text-gray-500 md:w-48 md:shrink-0 md:text-sm">Lien</dt>
          <dd className="mt-0.5 font-medium md:mt-0">
            {c.url_offre ? <LienOffre url={c.url_offre} /> : "—"}
          </dd>
        </div>
      </dl>
    </section>
  );

  const blocNotes = (
    <section className="rounded-lg border">
      <h2 className="border-b px-4 py-3 font-semibold">Notes</h2>
      <p className="whitespace-pre-wrap px-4 py-3 text-sm text-gray-700">
        {c.notes || "Aucune note."}
      </p>
    </section>
  );

  const blocEntreprise = (
    <FicheEntreprise id={c.id} ficheInitiale={c.fiche_entreprise} />
  );

  const blocDocuments = (
    <Documents
      id={c.id}
      cvPath={c.cv_path}
      lmPath={c.lm_path}
      cvReference={profil?.cv_reference_path ?? null}
    />
  );

  const blocCorrespondance = (
    <Correspondance
      id={c.id}
      analyseInitiale={c.analyse_json}
      cvPresent={!!c.cv_path}
      offrePresente={!!c.offre_texte}
    />
  );

  const blocEntretiens = <Entretiens candidatureId={c.id} entretiens={entretiens ?? []} />;
  const blocHistorique = <Historique evenements={historique ?? []} />;
    return (
    <div>
      <Link href="/candidatures" className="text-sm text-gray-500 hover:underline">
        Retour aux candidatures
      </Link>

      {c.archivee && (
        <div className="mt-4 rounded-lg border bg-gray-100 px-4 py-2 text-sm text-gray-600">
          Cette candidature est archivée.
        </div>
      )}

      <div className="mt-4 space-y-3 md:flex md:items-start md:justify-between md:space-y-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold md:text-3xl">{c.poste}</h1>
          <p className="mt-1 text-gray-600 md:text-lg">{c.entreprise}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Archiver id={c.id} archivee={c.archivee ?? false} />
          <Link
            href={`/candidatures/${c.id}/modifier`}
            className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Modifier
          </Link>
          <Actions id={c.id} statutInitial={c.statut} dateEnvoiExistante={c.date_envoi} />
        </div>
      </div>

      <div className="mt-6 space-y-4 lg:hidden">
        {blocDetails}
        {blocEntreprise}
        {blocDocuments}
        {blocCorrespondance}
        {blocEntretiens}
        {blocNotes}
        {blocHistorique}
      </div>

      <div className="mt-6 hidden gap-4 lg:grid lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {blocDetails}
          {blocEntreprise}
          {blocCorrespondance}
          {blocEntretiens}
          {blocNotes}
        </div>
        <div className="space-y-4">
          {blocDocuments}
          {blocHistorique}
        </div>
      </div>
    </div>
  );
}
