"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../supabase";
import { STATUTS, STATUTS_REPONSE, COULEURS_STATUT } from "../constantes";

function dateDuJour() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

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
  const [demandeDate, setDemandeDate] = useState<string | null>(null);
  const [dateEvenement, setDateEvenement] = useState(dateDuJour());
  const router = useRouter();

  async function appliquer(nouveau: string, dateReelle: string) {
    const ancien = statut;
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
      modifs.date_envoi = dateReelle;
    }

    if (nouveau === "Refus") {
      modifs.archivee = true;
    } else if (ancien === "Refus") {
      modifs.archivee = false;
    }

    await supabase.from("candidatures").update(modifs).eq("id", id);

    if (dateReelle !== dateDuJour()) {
      const { data: dernier } = await supabase
        .from("historique_statuts")
        .select("id")
        .eq("candidature_id", id)
        .eq("nouveau_statut", nouveau)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dernier) {
        await supabase
          .from("historique_statuts")
          .update({ date_evenement: dateReelle })
          .eq("id", dernier.id);
      }
    }

    setStatut(nouveau);
    setDemandeDate(null);
    setDateEvenement(dateDuJour());
    setLoading(false);
    router.refresh();
  }

  function changer(nouveau: string) {
    if (nouveau === statut) return;

    if (STATUTS_REPONSE.includes(nouveau) || nouveau === "Envoyée") {
      setDemandeDate(nouveau);
    } else {
      appliquer(nouveau, dateDuJour());
    }
  }

  const badge = COULEURS_STATUT[statut] ?? "bg-gray-100 text-gray-700";
    if (demandeDate) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={() => setDemandeDate(null)}
      >
        <div
          className="w-full max-w-xs rounded-xl bg-white p-5 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-sm font-medium">
            Passage en « {demandeDate} »
          </p>
          <p className="mt-1 text-xs text-gray-500">
            À quelle date cet événement a-t-il eu lieu ?
          </p>

          <input
            type="date"
            value={dateEvenement}
            max={dateDuJour()}
            onChange={(e) => setDateEvenement(e.target.value)}
            className="mt-3 w-full rounded border px-3 py-2 text-sm"
            autoFocus
          />

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => appliquer(demandeDate, dateEvenement)}
              disabled={loading}
              className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {loading ? "..." : "Confirmer"}
            </button>
            <button
              onClick={() => {
                setDemandeDate(null);
                setDateEvenement(dateDuJour());
              }}
              className="rounded border px-4 py-2 text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }

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
