"use client";

import Link from "next/link";
import { Suspense } from "react";
import Periode from "./Periode";

export default function BoutonImprimer() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-gray-50 px-4 py-3">
      <Suspense fallback={<div className="h-8" />}>
        <Periode />
      </Suspense>

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
