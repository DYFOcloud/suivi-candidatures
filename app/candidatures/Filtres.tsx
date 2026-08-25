"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const STATUTS = ["À envoyer", "Envoyée", "Entretien RH", "Proposition", "Refus"];

export default function Filtres() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const statut = params.get("statut") ?? "";
  const recherche = params.get("q") ?? "";
  const tri = params.get("tri") ?? "recent";

  function modifier(cle: string, valeur: string) {
    const nouveaux = new URLSearchParams(params.toString());
    if (valeur) nouveaux.set(cle, valeur);
    else nouveaux.delete(cle);
    router.push(`${pathname}?${nouveaux.toString()}`);
  }

  const actif = statut || recherche;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <input
        placeholder="Rechercher une entreprise, un poste..."
        defaultValue={recherche}
        onChange={(e) => modifier("q", e.target.value)}
        className="w-72 rounded border px-3 py-1.5 text-sm"
      />

      <select
        value={statut}
        onChange={(e) => modifier("statut", e.target.value)}
        className="rounded border px-3 py-1.5 text-sm"
      >
        <option value="">Tous les statuts</option>
        {STATUTS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        value={tri}
        onChange={(e) => modifier("tri", e.target.value)}
        className="rounded border px-3 py-1.5 text-sm"
      >
        <option value="recent">Plus récentes</option>
        <option value="ancien">Plus anciennes</option>
        <option value="entreprise">Entreprise (A-Z)</option>
      </select>

      {actif && (
        <button
          onClick={() => router.push(pathname)}
          className="text-sm text-gray-500 hover:underline"
        >
          Réinitialiser
        </button>
      )}
    </div>
  );
}
