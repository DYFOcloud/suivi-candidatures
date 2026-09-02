"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
  question: string;
  theme: string;
  probabilite: string;
};

export type Prep = {
  questions: Question[];
  vigilance: string[];
  questions_a_poser: string[];
  arguments_cles: string[];
};

const couleursProba: Record<string, string> = {
  "Très probable": "bg-violet-100 text-violet-700",
  "Very likely": "bg-violet-100 text-violet-700",
  "Probable": "bg-blue-100 text-blue-700",
  "Likely": "bg-blue-100 text-blue-700",
  "Possible": "bg-gray-100 text-gray-600",
};

export default function Preparation({
  entretienId,
  etape,
  prepInitiale,
  langueInitiale,
}: {
  entretienId: string;
  etape: string;
  prepInitiale: Prep | null;
  langueInitiale: string | null;
}) {
  const [prep, setPrep] = useState<Prep | null>(prepInitiale);
  const [langue, setLangue] = useState(langueInitiale ?? "fr");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const router = useRouter();

  async function generer(l: string) {
    setLoading(true);
    setErreur("");

    try {
      const reponse = await fetch("/api/preparer-entretien", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entretienId, langue: l }),
      });

      const donnees = await reponse.json();

      if (!reponse.ok) {
        setErreur(donnees.erreur ?? "Préparation impossible.");
      } else {
        setPrep(donnees);
        setLangue(l);
        router.refresh();
      }
    } catch {
      setErreur("Erreur de connexion.");
    }

    setLoading(false);
  }
    return (
    <div className="mt-3 rounded border bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Préparation — {etape}</p>
        <div className="flex gap-1">
          <button
            onClick={() => generer("fr")}
            disabled={loading}
            className={`rounded px-2 py-1 text-xs ${
              langue === "fr" && prep ? "bg-black text-white" : "border text-gray-600"
            } disabled:opacity-50`}
          >
            FR
          </button>
          <button
            onClick={() => generer("en")}
            disabled={loading}
            className={`rounded px-2 py-1 text-xs ${
              langue === "en" && prep ? "bg-black text-white" : "border text-gray-600"
            } disabled:opacity-50`}
          >
            EN
          </button>
        </div>
      </div>

      {erreur && <p className="mt-2 text-sm text-red-600">{erreur}</p>}

      {loading && (
        <p className="mt-3 text-sm text-gray-500">Génération en cours...</p>
      )}

      {!prep && !loading && (
        <div className="mt-3">
          <button
            onClick={() => generer(langue)}
            className="rounded bg-black px-4 py-2 text-sm text-white"
          >
            Générer les questions
          </button>
          <p className="mt-2 text-xs text-gray-500">
            Basé sur l&apos;offre, votre CV et l&apos;étape de l&apos;entretien.
          </p>
        </div>
      )}
            {prep && !loading && (
        <div className="mt-4 space-y-5 text-sm">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Questions probables ({prep.questions?.length ?? 0})
            </p>
            <ul className="mt-2 space-y-2">
              {prep.questions?.map((q, i) => (
                <li key={i} className="rounded border px-3 py-2">
                  <p className="text-gray-800">{q.question}</p>
                  <div className="mt-1.5 flex gap-2">
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                      {q.theme}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs ${
                        couleursProba[q.probabilite] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {q.probabilite}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {prep.vigilance?.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase text-orange-600">Points de vigilance</p>
              <ul className="mt-2 space-y-1 text-gray-700">
                {prep.vigilance.map((v, i) => (
                  <li key={i}>· {v}</li>
                ))}
              </ul>
            </div>
          )}

          {prep.arguments_cles?.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase text-green-700">Arguments à faire passer</p>
              <ul className="mt-2 space-y-1 text-gray-700">
                {prep.arguments_cles.map((a, i) => (
                  <li key={i}>· {a}</li>
                ))}
              </ul>
            </div>
          )}

          {prep.questions_a_poser?.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase text-blue-700">Questions à poser</p>
              <ul className="mt-2 space-y-1 text-gray-700">
                {prep.questions_a_poser.map((q, i) => (
                  <li key={i}>· {q}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => generer(langue)}
            className="text-xs text-gray-500 hover:underline"
          >
            Régénérer
          </button>
        </div>
      )}
    </div>
  );
}
