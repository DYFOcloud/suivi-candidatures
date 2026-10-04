"use client";

import { useState } from "react";

const ONGLETS = [
  { cle: "compte", label: "Compte" },
  { cle: "application", label: "Paramètres application" },
  { cle: "aide", label: "Aide" },
] as const;

type Cle = (typeof ONGLETS)[number]["cle"];

export default function Onglets({
  compte,
  application,
  aide,
}: {
  compte: React.ReactNode;
  application: React.ReactNode;
  aide: React.ReactNode;
}) {
  const [actif, setActif] = useState<Cle>("compte");

  const contenu = { compte, application, aide }[actif];

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto border-b">
        {ONGLETS.map((o) => (
          <button
            key={o.cle}
            onClick={() => setActif(o.cle)}
            className={`shrink-0 px-4 py-2 text-sm transition ${
              actif === o.cle
                ? "border-b-2 border-black font-medium text-black"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="mt-6">{contenu}</div>
    </div>
  );
}
