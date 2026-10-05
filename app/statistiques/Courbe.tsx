"use client";

type Point = { label: string; envois: number; reponses: number };

const LARGEUR = 680;
const HAUTEUR = 220;
const MARGE_G = 32;
const MARGE_D = 12;
const MARGE_H = 16;
const MARGE_B = 32;

export default function Courbe({ serie }: { serie: Point[] }) {
  const total = serie.reduce((a, p) => a + p.envois, 0);

  if (total === 0) {
    return (
      <section className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold">Évolution</h2>
          <p className="text-xs text-gray-500">Sur les 12 derniers mois</p>
        </div>
        <p className="px-4 py-6 text-sm text-gray-400">
          Aucune candidature envoyée sur cette période.
        </p>
      </section>
    );
  }

  const max = Math.max(...serie.map((p) => Math.max(p.envois, p.reponses)), 1);
  const paliers = max <= 5 ? max : 5;

  const largeurUtile = LARGEUR - MARGE_G - MARGE_D;
  const hauteurUtile = HAUTEUR - MARGE_H - MARGE_B;

  function x(i: number) {
    if (serie.length === 1) return MARGE_G + largeurUtile / 2;
    return MARGE_G + (i * largeurUtile) / (serie.length - 1);
  }

  function y(valeur: number) {
    return MARGE_H + hauteurUtile - (valeur / max) * hauteurUtile;
  }

  function chemin(cle: "envois" | "reponses") {
    return serie
      .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p[cle])}`)
      .join(" ");
  }

  const graduations = Array.from({ length: paliers + 1 }, (_, i) =>
    Math.round((max / paliers) * i)
  );
    return (
    <section className="rounded-lg border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 className="font-semibold">Évolution</h2>
          <p className="text-xs text-gray-500">Sur les 12 derniers mois</p>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded bg-violet-600" />
            <span className="text-gray-600">Candidatures envoyées</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded bg-emerald-600" />
            <span className="text-gray-600">Réponses reçues</span>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto px-4 py-5">
        <svg
          viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`}
          className="h-auto w-full min-w-[560px]"
        >
          {graduations.map((g, i) => (
            <g key={i}>
              <line
                x1={MARGE_G}
                y1={y(g)}
                x2={LARGEUR - MARGE_D}
                y2={y(g)}
                stroke="#F3F4F6"
                strokeWidth="1"
              />
              <text
                x={MARGE_G - 8}
                y={y(g) + 4}
                textAnchor="end"
                fontSize="10"
                fill="#9CA3AF"
              >
                {g}
              </text>
            </g>
          ))}

          <path
            d={chemin("envois")}
            fill="none"
            stroke="#7C3AED"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={chemin("reponses")}
            fill="none"
            stroke="#059669"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {serie.map((p, i) => (
            <g key={i}>
              <circle cx={x(i)} cy={y(p.envois)} r="3" fill="#7C3AED" />
              <circle cx={x(i)} cy={y(p.reponses)} r="3" fill="#059669" />
              <title>
                {p.label} — {p.envois} envoi{p.envois > 1 ? "s" : ""}, {p.reponses}{" "}
                réponse{p.reponses > 1 ? "s" : ""}
              </title>
            </g>
          ))}

          {serie.map((p, i) => (
            <text
              key={i}
              x={x(i)}
              y={HAUTEUR - 10}
              textAnchor="middle"
              fontSize="10"
              fill="#9CA3AF"
            >
              {i % 2 === 0 ? p.label : ""}
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}
