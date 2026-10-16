"use client";

import { useRouter, useSearchParams } from "next/navigation";

const CHOIX = [
  { valeur: "1", label: "1 mois" },
  { valeur: "6", label: "6 mois" },
  { valeur: "12", label: "12 mois" },
];

export default function Periode() {
  const router = useRouter();
  const params = useSearchParams();
  const actif = params.get("mois") ?? "12";

  function changer(valeur: string) {
    router.push(`/rapport?mois=${valeur}`);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">Période</span>
      <div className="flex rounded border">
        {CHOIX.map((c, i) => (
          <button
            key={c.valeur}
            onClick={() => changer(c.valeur)}
            className={`px-3 py-1.5 text-xs transition ${
              actif === c.valeur
                ? "bg-black text-white"
                : "text-gray-600 hover:bg-gray-50"
            } ${i === 0 ? "rounded-l" : ""} ${
              i === CHOIX.length - 1 ? "rounded-r" : "border-r"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
