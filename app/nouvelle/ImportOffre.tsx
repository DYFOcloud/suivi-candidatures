"use client";

import { useState } from "react";

export type DonneesOffre = {
  entreprise: string | null;
  poste: string | null;
  lieu: string | null;
  type_contrat: string | null;
  date_publication: string | null;
  reference: string | null;
  salaire_min: number | null;
  salaire_max: number | null;
  notes: string | null;
};

export default function ImportOffre({
  onExtraction,
}: {
  onExtraction: (d: DonneesOffre, texteBrut: string) => void;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [texte, setTexte] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  async function analyser() {
    if (texte.length < 50) {
      setErreur("Collez le texte complet de l'offre.");
      return;
    }

    setLoading(true);
    setErreur("");

    try {
      const reponse = await fetch("/api/extraire-offre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texte }),
      });

      const donnees = await reponse.json();

      if (!reponse.ok) {
        setErreur(donnees.erreur ?? "Erreur lors de l'analyse.");
        setLoading(false);
        return;
      }

      onExtraction(donnees, texte);
      setOuvert(false);
      setTexte("");
    } catch {
      setErreur("Erreur de connexion.");
    }

    setLoading(false);
  }

  if (!ouvert) {
    return (
      <button
        onClick={() => setOuvert(true)}
        className="w-full rounded-lg border border-dashed py-3 text-sm text-gray-600 hover:bg-gray-50"
      >
        Coller une offre pour remplir automatiquement
      </button>
    );
  }

  return (
    <div className="rounded-lg border bg-gray-50 p-4">
      <p className="text-sm font-medium">Coller le texte de l&apos;offre</p>
      <p className="mt-1 text-xs text-gray-500">
        Sur la page de l&apos;offre : Ctrl+A puis Ctrl+C, et collez ici.
      </p>

      <textarea
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        rows={6}
        className="mt-3 w-full rounded border px-3 py-2 text-sm"
        placeholder="Collez ici..."
      />

      {erreur && <p className="mt-2 text-sm text-red-600">{erreur}</p>}

      <div className="mt-3 flex gap-2">
        <button
          onClick={analyser}
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {loading ? "Analyse en cours..." : "Analyser"}
        </button>
        <button
          onClick={() => {
            setOuvert(false);
            setErreur("");
          }}
          className="rounded border px-4 py-2 text-sm"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
