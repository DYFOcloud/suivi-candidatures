"use client";

import { useState } from "react";
import Link from "next/link";
import NouvelEntretien from "./NouvelEntretien";

export type EntretienAgenda = {
  id: string;
  candidature_id: string;
  etape: string;
  date_entretien: string | null;
  interlocuteur: string | null;
  format: string | null;
  candidatures: { entreprise: string; poste: string } | null;
};

export type CandidatureOption = {
  id: string;
  entreprise: string;
  poste: string;
};

const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

const JOURS = ["L", "M", "M", "J", "V", "S", "D"];

function cleJour(d: Date) {
  return d.toISOString().slice(0, 10);
}

function heure(d: string) {
  return new Date(d).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Calendrier({
  entretiens,
  candidatures,
}: {
  entretiens: EntretienAgenda[];
  candidatures: CandidatureOption[];
}) {
  const aujourdhui = new Date();
  const [mois, setMois] = useState(aujourdhui.getMonth());
  const [annee, setAnnee] = useState(aujourdhui.getFullYear());
  const [jourSelectionne, setJourSelectionne] = useState<string | null>(null);

  const parJour = new Map<string, EntretienAgenda[]>();
  for (const e of entretiens) {
    if (!e.date_entretien) continue;
    const cle = e.date_entretien.slice(0, 10);
    if (!parJour.has(cle)) parJour.set(cle, []);
    parJour.get(cle)!.push(e);
  }

  const premierJour = new Date(annee, mois, 1);
  const dernierJour = new Date(annee, mois + 1, 0);
  const decalage = (premierJour.getDay() + 6) % 7;

  const cases: (Date | null)[] = [];
  for (let i = 0; i < decalage; i++) cases.push(null);
  for (let j = 1; j <= dernierJour.getDate(); j++) {
    cases.push(new Date(annee, mois, j));
  }

  function moisPrecedent() {
    if (mois === 0) {
      setMois(11);
      setAnnee(annee - 1);
    } else {
      setMois(mois - 1);
    }
    setJourSelectionne(null);
  }

  function moisSuivant() {
    if (mois === 11) {
      setMois(0);
      setAnnee(annee + 1);
    } else {
      setMois(mois + 1);
    }
    setJourSelectionne(null);
  }

  const entretiensDuJour = jourSelectionne
    ? parJour.get(jourSelectionne) ?? []
    : [];
      return (
    <div className="space-y-4">
      <section className="rounded-lg border">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <button
            onClick={moisPrecedent}
            className="rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
          >
            ‹
          </button>
          <h2 className="font-semibold">
            {MOIS[mois]} {annee}
          </h2>
          <button
            onClick={moisSuivant}
            className="rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 border-b text-center text-xs text-gray-500">
          {JOURS.map((j, i) => (
            <div key={i} className="py-2">
              {j}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cases.map((d, i) => {
            if (!d) return <div key={i} className="min-h-[80px] border-b border-r md:min-h-[110px]" />;

            const cle = cleJour(d);
            const duJour = parJour.get(cle) ?? [];
            const nb = duJour.length;
            const estAujourdhui = cle === cleJour(aujourdhui);
            const selectionne = cle === jourSelectionne;

            return (
              <button
                key={i}
                onClick={() => setJourSelectionne(selectionne ? null : cle)}
                className={`flex min-h-[80px] flex-col items-start gap-0.5 border-b border-r p-1 text-left transition md:min-h-[110px] ${
                  selectionne
                    ? "bg-black text-white"
                    : estAujourdhui
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <span
                  className={`px-1 text-xs ${
                    estAujourdhui && !selectionne ? "font-bold" : ""
                  }`}
                >
                  {d.getDate()}
                </span>

                {duJour.slice(0, 2).map((e) => (
                  <span
                    key={e.id}
                    className={`w-full truncate rounded px-1 py-0.5 text-[10px] leading-tight ${
                      selectionne ? "bg-white/20" : "bg-violet-100 text-violet-900"
                    }`}
                  >
                    <strong>{heure(e.date_entretien!)}</strong>{" "}
                    {e.candidatures?.entreprise ?? "—"}
                    <span className="hidden md:inline"> · {e.etape}</span>
                  </span>
                ))}

                {nb > 2 && (
                  <span
                    className={`px-1 text-[10px] ${
                      selectionne ? "text-white/70" : "text-gray-500"
                    }`}
                  >
                    +{nb - 2}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>
            {jourSelectionne && (
        <section className="rounded-lg border">
          <h2 className="border-b px-4 py-3 font-semibold">
            {new Date(jourSelectionne).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h2>

          {entretiensDuJour.length > 0 && (
            <ul className="divide-y border-b">
              {entretiensDuJour.map((e) => (
                <li key={e.id} className="px-4 py-3">
                  <Link
                    href={`/candidatures/${e.candidature_id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {e.candidatures?.entreprise ?? "—"}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {heure(e.date_entretien!)}
                    {" · "}
                    {e.etape}
                    {e.interlocuteur && ` · ${e.interlocuteur}`}
                    {e.format && ` · ${e.format}`}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <NouvelEntretien jour={jourSelectionne} candidatures={candidatures} />
        </section>
      )}
    </div>
  );
}
