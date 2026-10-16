"use client";

type Point = { label: string; envois: number; reponses: number };

const LARGEUR = 680;
const HAUTEUR = 240;
const MARGE_G = 34;
const MARGE_D = 12;
const MARGE_H = 16;
const MARGE_B = 34;

export default function Courbe({ serie }: { serie: Point[] }) {
  const totalEnvois = serie.reduce((a, p) => a + p.envois, 0);
  const totalReponses = serie.reduce((a, p) => a + p.reponses, 0);

  if (totalEnvois === 0) {
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

  const largeurGroupe = largeurUtile / serie.length;
  const largeurBarre = Math.min(14, (largeurGroupe - 6) / 2);

  function y(valeur: number) {
    return MARGE_H + hauteurUtile - (valeur / max) * hauteurUtile;
  }

  function hauteur(valeur: number) {
    if (valeur === 0) return 0;
    return (valeur / max) * hauteurUtile;
  }

  function xGroupe(i: number) {
    return MARGE_G + i * largeurGroupe + largeurGroupe / 2;
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
            <span className="h-2.5 w-2.5 rounded-sm bg-blue-600" />
            <span className="text-gray-600">Envoyées ({totalEnvois})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" />
            <span className="text-gray-600">Réponses ({totalReponses})</span>
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
                stroke="#E5E7EB"
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

          {serie.map((p, i) => {
            const centre = xGroupe(i);
            return (
              <g key={i}>
                <rect
                  x={centre - largeurBarre - 1}
                  y={y(p.envois)}
                  width={largeurBarre}
                  height={hauteur(p.envois)}
                  rx="2"
                  fill="#2563EB"
                />
                <rect
                  x={centre + 1}
                  y={y(p.reponses)}
                  width={largeurBarre}
                  height={hauteur(p.reponses)}
                  rx="2"
                  fill="#059669"
                />
                <title>
                  {p.envois} envoi{p.envois > 1 ? "s" : ""} · {p.reponses}{" "}
                  réponse{p.reponses > 1 ? "s" : ""}
                </title>
              </g>
            );
          })}

          {serie.map((p, i) => (
            <text
              key={i}
              x={xGroupe(i)}
              y={HAUTEUR - 12}
              textAnchor="middle"
              fontSize="10"
              fill="#9CA3AF"
            >
              {p.label}
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}
 