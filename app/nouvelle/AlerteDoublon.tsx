"use client";

import Link from "next/link";

export type Doublon = {
  id: string;
  entreprise: string;
  poste: string;
  statut: string;
  date_envoi: string | null;
  created_at: string;
};

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("fr-FR");
}

export default function AlerteDoublon({
  doublons,
  onConfirmer,
  onAnnuler,
  loading,
}: {
  doublons: Doublon[];
  onConfirmer: () => void;
  onAnnuler: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onAnnuler}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-amber-200 bg-amber-50 px-5 py-4">
          <p className="font-semibold text-amber-900">
            {doublons.length === 1
              ? "Une candidature similaire existe déjà"
              : `${doublons.length} candidatures similaires existent déjà`}
          </p>
          <p className="mt-1 text-xs text-amber-800">
            Vérifiez qu&apos;il ne s&apos;agit pas de la même offre.
          </p>
        </div>

        <ul className="divide-y px-5 py-3">
          {doublons.map((d) => (
            <li key={d.id} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{d.entreprise}</p>
                  <p className="text-xs text-gray-600">{d.poste}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {d.statut}
                    {formatDate(d.date_envoi)
                      ? ` · envoyée le ${formatDate(d.date_envoi)}`
                      : ` · créée le ${formatDate(d.created_at)}`}
                  </p>
                </div>
                <Link
                  href={`/candidatures/${d.id}`}
                  target="_blank"
                  className="shrink-0 text-xs text-blue-600 hover:underline"
                >
                  Voir
                </Link>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2 border-t px-5 py-4">
          <button
            onClick={onConfirmer}
            disabled={loading}
            className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {loading ? "Enregistrement..." : "Enregistrer quand même"}
          </button>
          <button
            onClick={onAnnuler}
            className="rounded border px-4 py-2 text-sm"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
