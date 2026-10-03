"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../supabase";

type Analyse = {
  score: number;
  points_forts: string[];
  manques: string[];
  suggestions: string[];
};

function couleurScore(score: number) {
  if (score >= 75) return "text-green-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

export default function Correspondance({
  id,
  analyseInitiale,
  cvPresent,
  offrePresente,
}: {
  id: string;
  analyseInitiale: Analyse | null;
  cvPresent: boolean;
  offrePresente: boolean;
}) {
  const [analyse, setAnalyse] = useState<Analyse | null>(analyseInitiale);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [formOuvert, setFormOuvert] = useState(false);
  const [texte, setTexte] = useState("");
  const [sauvegarde, setSauvegarde] = useState(false);
  const router = useRouter();

  async function enregistrerOffre() {
    if (texte.length < 50) {
      setErreur("Le texte semble trop court.");
      return;
    }

    setSauvegarde(true);
    setErreur("");

    const supabase = createClient();
    const { error } = await supabase
      .from("candidatures")
      .update({ offre_texte: texte })
      .eq("id", id);

    setSauvegarde(false);

    if (error) {
      setErreur(error.message);
    } else {
      setFormOuvert(false);
      setTexte("");
      router.refresh();
    }
  }

  async function lancer() {
    setLoading(true);
    setErreur("");

    try {
      const reponse = await fetch("/api/analyser-correspondance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidatureId: id }),
      });

      const donnees = await reponse.json();

      if (!reponse.ok) {
        setErreur(donnees.erreur ?? "Analyse impossible.");
      } else {
        setAnalyse(donnees);
        router.refresh();
      }
    } catch {
      setErreur("Erreur de connexion.");
    }

    setLoading(false);
  }
    return (
    <section className="rounded-lg border">
      <h2 className="border-b px-5 py-3 font-semibold">Correspondance CV / offre</h2>

      {!offrePresente ? (
        <div className="px-5 py-4">
          {formOuvert ? (
            <div>
              <p className="text-sm font-medium">Texte de l&apos;offre</p>
              <p className="mt-1 text-xs text-gray-500">
                Sur la page de l&apos;annonce : Ctrl+A puis Ctrl+C, et collez ici.
              </p>
              <textarea
                value={texte}
                onChange={(e) => setTexte(e.target.value)}
                rows={6}
                className="mt-2 w-full rounded border px-3 py-2 text-sm"
                placeholder="Collez le texte de l'offre..."
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={enregistrerOffre}
                  disabled={sauvegarde}
                  className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {sauvegarde ? "Enregistrement..." : "Enregistrer"}
                </button>
                <button
                  onClick={() => {
                    setFormOuvert(false);
                    setErreur("");
                  }}
                  className="rounded border px-4 py-2 text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div>
                           <p className="text-sm text-gray-600">
                Copiez-collez l&apos;annonce complète telle qu&apos;elle est
                publiée pour obtenir votre score de correspondance.
              </p>
              <button
                onClick={() => setFormOuvert(true)}
                className="mt-3 rounded bg-black px-4 py-2 text-sm text-white"
              >
                Coller le texte de l&apos;offre
              </button>
            </div>
          )}
          {erreur && <p className="mt-2 text-sm text-red-600">{erreur}</p>}
        </div>
      ) : !cvPresent ? (
        <p className="px-5 py-4 text-sm text-gray-500">
          Ajoutez un CV au format PDF pour lancer l&apos;analyse.
        </p>
      ) : !analyse ? (
        <div className="px-5 py-4">
          <button
            onClick={lancer}
            disabled={loading}
            className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {loading ? "Analyse en cours..." : "Analyser la correspondance"}
          </button>
          {erreur && <p className="mt-2 text-sm text-red-600">{erreur}</p>}
        </div>
      ) : (
                <div className="px-5 py-4">
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold ${couleurScore(analyse.score)}`}>
              {analyse.score}
            </span>
            <span className="text-sm text-gray-500">/ 100</span>
          </div>

          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="font-medium text-green-700">Points forts</p>
              <ul className="mt-1 space-y-1 text-gray-700">
                {analyse.points_forts?.map((p, i) => (
                  <li key={i}>· {p}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-medium text-red-700">Manques</p>
              <ul className="mt-1 space-y-1 text-gray-700">
                {analyse.manques?.map((m, i) => (
                  <li key={i}>· {m}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-medium text-blue-700">Suggestions</p>
              <ul className="mt-1 space-y-1 text-gray-700">
                {analyse.suggestions?.map((s, i) => (
                  <li key={i}>· {s}</li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={lancer}
            disabled={loading}
            className="mt-4 text-xs text-gray-500 hover:underline disabled:opacity-50"
          >
            {loading ? "Analyse en cours..." : "Relancer l'analyse"}
          </button>
          {erreur && <p className="mt-2 text-sm text-red-600">{erreur}</p>}
        </div>
      )}
    </section>
  );
}
