"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../supabase";
import { STATUTS, STATUTS_REPONSE } from "../../constantes";

function dateDuJour() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

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

  function changerStatut(nouveau: string) {
    if (nouveau === statut) return;

    if (STATUTS_REPONSE.includes(nouveau) || nouveau === "Envoyée") {
      setDemandeDate(nouveau);
    } else {
      appliquer(nouveau, dateDuJour());
    }
  }

  async function supprimer() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("candidatures").delete().eq("id", id);
    router.push("/candidatures");
    router.refresh();
  }
    return (
    <>
      {demandeDate && (
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
      )}

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
    </>
  );
}
