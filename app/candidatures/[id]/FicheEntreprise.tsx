"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type Fiche = {
  nom: string | null;
  localisation: string | null;
  annee_creation: string | null;
  effectif: string | null;
  secteur: string | null;
  resume: string | null;
  a_savoir: string[];
  fiabilite: "certaine" | "partielle" | "inconnue";
};

function Valeur({ v }: { v: string | null }) {
  if (!v) return <span className="text-gray-400">Non disponible</span>;
  return <span className="font-medium text-gray-700">{v}</span>;
}

export default function FicheEntreprise({
  id,
  ficheInitiale,
}: {
  id: string;
  ficheInitiale: Fiche | null;
}) {
  const [fiche, setFiche] = useState<Fiche | null>(ficheInitiale);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const router = useRouter();

  async function generer() {
    setLoading(true);
    setErreur("");

    try {
      const reponse = await fetch("/api/fiche-entreprise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidatureId: id }),
      });

      const donnees = await reponse.json();

      if (!reponse.ok) {
        setErreur(donnees.erreur ?? "Génération impossible.");
      } else {
        setFiche(donnees);
        router.refresh();
      }
    } catch {
      setErreur("Erreur de connexion.");
    }

    setLoading(false);
  }

  const lignes = fiche
    ? [
        { label: "Localisation", valeur: fiche.localisation },
        { label: "Création", valeur: fiche.annee_creation },
        { label: "Effectif", valeur: fiche.effectif },
        { label: "Secteur", valeur: fiche.secteur },
      ]
    : [];
      return (
    <section className="rounded-lg border bg-gray-50/60">
      <div className="flex items-center justify-between px-3 py-2">
        <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Informations sur l&apos;entreprise
        </h2>
        {fiche && (
          <button
            onClick={generer}
            disabled={loading}
            className="text-[11px] text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            {loading ? "..." : "Régénérer"}
          </button>
        )}
      </div>

      {!fiche ? (
        <div className="px-3 pb-3">
          <button
            onClick={generer}
            disabled={loading}
            className="rounded border bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Génération..." : "Générer la fiche"}
          </button>
          {erreur && <p className="mt-2 text-xs text-red-600">{erreur}</p>}
        </div>
      ) : fiche.fiabilite === "inconnue" ? (
        <div className="px-3 pb-3">
          <p className="text-xs text-gray-500">
            Aucune information fiable disponible. Structure récente, de petite
            taille, ou nom ambigu — consultez son site et sa page LinkedIn.
          </p>
        </div>
      ) : (
        <div className="px-3 pb-3">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
            {lignes.map((l) => (
              <div key={l.label} className="flex gap-1.5">
                <dt className="shrink-0 text-gray-400">{l.label}</dt>
                <dd className="min-w-0 truncate">
                  <Valeur v={l.valeur} />
                </dd>
              </div>
            ))}
          </dl>

          {fiche.resume && (
            <p className="mt-2.5 border-t pt-2.5 text-xs leading-relaxed text-gray-600">
              {fiche.resume}
            </p>
          )}

          {fiche.a_savoir?.length > 0 && (
            <ul className="mt-2.5 space-y-1 border-t pt-2.5 text-xs text-gray-600">
              {fiche.a_savoir.map((a, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-gray-400">·</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-2.5 text-[10px] text-gray-400">
            {fiche.fiabilite === "partielle"
              ? "Informations partielles — à vérifier."
              : "Généré automatiquement — à vérifier sur le site de l'entreprise."}
          </p>

          {erreur && <p className="mt-2 text-xs text-red-600">{erreur}</p>}
        </div>
      )}
    </section>
  );
}
