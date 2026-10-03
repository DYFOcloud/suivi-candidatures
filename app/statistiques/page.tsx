import { createClient } from "../supabase-server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const SEUIL_MINI = 5;

type Ligne = {
  cle: string;
  total: number;
  reponses: number;
  entretiens: number;
};

function regrouper(
  candidatures: { statut: string; [k: string]: unknown }[],
  champ: string
): Ligne[] {
  const map = new Map<string, Ligne>();

  for (const c of candidatures) {
    const cle = (c[champ] as string) ?? "Non renseigné";
    if (!map.has(cle)) {
      map.set(cle, { cle, total: 0, reponses: 0, entretiens: 0 });
    }
    const l = map.get(cle)!;
    l.total++;
    if (["Entretien RH", "Proposition", "Refus"].includes(c.statut)) l.reponses++;
    if (["Entretien RH", "Proposition"].includes(c.statut)) l.entretiens++;
  }

  return [...map.values()].sort((a, b) => b.total - a.total);
}

function pourcent(n: number, total: number) {
  if (total === 0) return "—";
  return `${Math.round((n / total) * 100)} %`;
}

export default async function Statistiques() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: candidatures } = await supabase.from("candidatures").select("*");
  const { data: historique } = await supabase.from("historique_statuts").select("*");
  const { data: entretiensData } = await supabase.from("entretiens").select("*");

  const liste = candidatures ?? [];
  const envoyees = liste.filter((c) => c.statut !== "À envoyer");
  const reponses = liste.filter((c) =>
    ["Entretien RH", "Proposition", "Refus"].includes(c.statut)
  );
  const entretiens = liste.filter((c) =>
    ["Entretien RH", "Proposition"].includes(c.statut)
  );
  const propositions = liste.filter((c) => c.statut === "Proposition");

  const assez = envoyees.length >= SEUIL_MINI;

  let delaiMoyen: number | null = null;
  if (historique && historique.length > 0) {
    const delais: number[] = [];
    for (const c of liste) {
      if (!c.date_envoi) continue;
      const premiereReponse = historique
        .filter(
          (h) =>
            h.candidature_id === c.id &&
            ["Entretien RH", "Proposition", "Refus"].includes(h.nouveau_statut)
        )
        .sort((a, b) => (a.date_evenement > b.date_evenement ? 1 : -1))[0];

      if (premiereReponse) {
        const jours = Math.round(
          (new Date(premiereReponse.date_evenement).getTime() -
            new Date(c.date_envoi).getTime()) /
            86400000
        );
        if (jours >= 0) delais.push(jours);
      }
    }
    if (delais.length >= 3) {
      delaiMoyen = Math.round(delais.reduce((a, b) => a + b, 0) / delais.length);
    }
  }
    const kpis = [
    { label: "Candidatures envoyées", valeur: envoyees.length },
    {
      label: "Taux de réponse",
      valeur: assez ? pourcent(reponses.length, envoyees.length) : "—",
      note: !assez ? `${SEUIL_MINI} envois minimum` : undefined,
    },
    {
      label: "Taux d'entretien",
      valeur: assez ? pourcent(entretiens.length, envoyees.length) : "—",
      note: !assez ? `${SEUIL_MINI} envois minimum` : undefined,
    },
    {
      label: "Délai moyen de réponse",
      valeur: delaiMoyen !== null ? `${delaiMoyen} j` : "—",
      note: delaiMoyen === null ? "3 réponses minimum" : undefined,
    },
  ];

  const parSource = regrouper(liste, "source");
  const parPoste = regrouper(liste, "poste");
  const parContrat = regrouper(liste, "type_contrat");

  function Tableau({ titre, lignes }: { titre: string; lignes: Ligne[] }) {
    const pertinentes = lignes.filter((l) => l.total >= 3);

    return (
      <section className="rounded-lg border">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="font-semibold">{titre}</h2>
          <span className="text-xs text-gray-500">3 candidatures minimum</span>
        </div>

        {pertinentes.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400">
            Pas encore assez de données.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-2"></th>
                <th className="px-5 py-2">Total</th>
                <th className="px-5 py-2">Réponses</th>
                <th className="px-5 py-2">Entretiens</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pertinentes.map((l) => (
                <tr key={l.cle}>
                  <td className="px-5 py-3 font-medium">{l.cle}</td>
                  <td className="px-5 py-3 text-gray-600">{l.total}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {pourcent(l.reponses, l.total)}
                  </td>
                  <td className="px-5 py-3 font-medium">
                    {pourcent(l.entretiens, l.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    );
  }
    return (
    <div>
      <h1 className="text-3xl font-bold">Statistiques</h1>
      <p className="mt-2 text-gray-600">
        {liste.length} candidature{liste.length > 1 ? "s" : ""} au total
        {entretiensData && entretiensData.length > 0 &&
          ` · ${entretiensData.length} entretien${entretiensData.length > 1 ? "s" : ""} enregistré${entretiensData.length > 1 ? "s" : ""}`}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-lg border p-5">
            <p className="text-sm text-gray-500">{k.label}</p>
            <p className="mt-2 text-3xl font-bold">{k.valeur}</p>
            {k.note && <p className="mt-1 text-xs text-gray-400">{k.note}</p>}
          </div>
        ))}
      </div>

      {propositions.length > 0 && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-5 py-3 text-sm text-green-900">
          {propositions.length} proposition{propositions.length > 1 ? "s" : ""} reçue
          {propositions.length > 1 ? "s" : ""}
        </div>
      )}

      <div className="mt-8 space-y-6">
        <Tableau titre="Par source" lignes={parSource} />
        <Tableau titre="Par poste" lignes={parPoste} />
        <Tableau titre="Par type de contrat" lignes={parContrat} />
      </div>

      <p className="mt-8 text-xs text-gray-400">
        Les statistiques calculées sur moins de 3 candidatures ne sont pas
        affichées : un taux établi sur un trop petit nombre de cas n&apos;est pas
        représentatif.
      </p>
    </div>
  );
}
