"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../supabase";

const STATUTS = ["À envoyer", "Envoyée", "Entretien RH", "Proposition", "Refus"];

export default function Actions({
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
  const [confirme, setConfirme] = useState(false);
  const router = useRouter();

  async function changerStatut(nouveau: string) {
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

  async function supprimer() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("candidatures").delete().eq("id", id);
    router.push("/candidatures");
    router.refresh();
  }
    return (
    <div className="flex items-center gap-3">
      <select
        value={statut}
        onChange={(e) => changerStatut(e.target.value)}
        disabled={loading}
        className="rounded border px-3 py-1.5 text-sm"
      >
        {STATUTS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {confirme ? (
        <>
          <button
            onClick={supprimer}
            disabled={loading}
            className="rounded bg-red-600 px-3 py-1.5 text-sm text-white"
          >
            Confirmer
          </button>
          <button
            onClick={() => setConfirme(false)}
            className="rounded border px-3 py-1.5 text-sm"
          >
            Annuler
          </button>
        </>
      ) : (
        <button
          onClick={() => setConfirme(true)}
          className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
        >
          Supprimer
        </button>
      )}
    </div>
  );
}
