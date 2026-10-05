"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../supabase";
import { STATUTS, COULEURS_STATUT } from "../constantes";

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
    const ancien = statut;
    setStatut(nouveau);
    setLoading(true);

    const supabase = createClient();
    const modifs: {
      statut: string;
      date_envoi?: string | null;
      archivee?: boolean;
    } = { statut: nouveau };

    if (nouveau === "À envoyer") {
      modifs.date_envoi = null;
    } else if (nouveau === "Envoyée" && !dateEnvoiExistante) {
      modifs.date_envoi = new Date().toISOString().slice(0, 10);
    }

    if (nouveau === "Refus") {
      modifs.archivee = true;
    } else if (ancien === "Refus") {
      modifs.archivee = false;
    }

    await supabase.from("candidatures").update(modifs).eq("id", id);

    setLoading(false);
    router.refresh();
  }

  const badge = COULEURS_STATUT[statut] ?? "bg-gray-100 text-gray-700";

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
