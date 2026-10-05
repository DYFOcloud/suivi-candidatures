"use client";

import Link from "next/link";

export default function BoutonImprimer() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-gray-50 px-4 py-3">
      <div>
        <p className="text-sm font-medium">Enregistrer en PDF</p>
        <p className="text-xs text-gray-500">
          Dans la fenêtre d&apos;impression, choisissez « Enregistrer au format
          PDF » comme destination.
        </p>
      </div>
      <div className="flex gap-2">
        <Link href="/documents" className="rounded border px-3 py-1.5 text-sm">
          Retour
        </Link>
        <button
          onClick={() => window.print()}
          className="rounded bg-black px-4 py-1.5 text-sm text-white"
        >
          Imprimer / PDF
        </button>
      </div>
    </div>
  );
}
