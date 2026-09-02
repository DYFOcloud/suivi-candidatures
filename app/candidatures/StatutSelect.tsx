"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../supabase";

const STATUTS = ["À envoyer", "Envoyée", "Entretien RH", "Proposition", "Refus"];

const couleurs: Record<string, string> = {
  "À envoyer": "bg-orange-100 text-orange-700",
  "Envoyée": "bg-blue-100 text-blue-700",
  "Entretien RH": "bg-violet-100 text-violet-700",
  "Proposition": "bg-green-100 text-green-700",
  "Refus": "bg-red-100 text-red-700",
};

export default function StatutSelect({
  id,
  statutInitial,
  dateEnvoiExistante,
}: {
  id: string;
  statutInitial: string;
  dateEnvoiExistante: string | null;
}) {
  const [statut, setStatut] = useState(statutInitial);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function changer(nouveau: string) {
    setStatut(nouveau);
    setLoading(true);

    const supabase = createClient();
    const modifs: { statut: string; date_envoi?: string | null } = { statut: nouveau };

    if (nouveau === "À envoyer") {
      modifs.date_envoi = null;
    } else if (nouveau === "Envoyée" && !dateEnvoiExistante) {
      modifs.date_envoi = new Date().toISOString().slice(0, 10);
    }

    await supabase.from("candidatures").update(modifs).eq("id", id);

    setLoading(false);
    router.refresh();
  }

  const badge = couleurs[statut] ?? "bg-gray-100 text-gray-700";

  return (
    <select
      value={statut}
      onChange={(e) => changer(e.target.value)}
      disabled={loading}
      className={`cursor-pointer rounded-full border-0 px-3 py-1 text-xs font-medium ${badge} disabled:opacity-50`}
    >
      {STATUTS.map((s) => (
        <option key={s} value={s} className="bg-white text-gray-900">
          {s}
        </option>
      ))}
    </select>
  );
}
