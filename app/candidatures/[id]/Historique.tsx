"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../supabase";

type Evenement = {
  id: string;
  ancien_statut: string | null;
  nouveau_statut: string;
  date_evenement: string;
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Historique({ evenements }: { evenements: Evenement[] }) {
  const [editionId, setEditionId] = useState<string | null>(null);
  const [suppressionId, setSuppressionId] = useState<string | null>(null);
  const [nouvelleDate, setNouvelleDate] = useState("");
  const router = useRouter();

  async function enregistrerDate(id: string) {
    if (!nouvelleDate) return;
    const supabase = createClient();
    await supabase
      .from("historique_statuts")
      .update({ date_evenement: nouvelleDate })
      .eq("id", id);
    setEditionId(null);
    router.refresh();
  }

  async function supprimer(id: string) {
    const supabase = createClient();
    await supabase.from("historique_statuts").delete().eq("id", id);
    setSuppressionId(null);
    router.refresh();
  }

  return (
    <section className="rounded-lg border">
      <h2 className="border-b px-5 py-3 font-semibold">Historique</h2>

      {evenements.length === 0 ? (
        <p className="px-5 py-4 text-sm text-gray-400">Aucun changement.</p>
      ) : (
        <ul className="divide-y">
          {evenements.map((e) => (
            <li key={e.id} className="group px-5 py-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{e.nouveau_statut}</p>

                {suppressionId !== e.id && (
                  <button
                    onClick={() => setSuppressionId(e.id)}
                    className="text-xs text-gray-300 hover:text-red-600 group-hover:text-gray-500"
                  >
                    Supprimer
                  </button>
                )}
              </div>

              {suppressionId === e.id ? (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Supprimer cette entrée ?</span>
                  <button
                    onClick={() => supprimer(e.id)}
                    className="rounded bg-red-600 px-2 py-1 text-xs text-white"
                  >
                    Oui
                  </button>
                  <button
                    onClick={() => setSuppressionId(null)}
                    className="text-xs text-gray-500"
                  >
                    Non
                  </button>
                </div>
              ) : editionId === e.id ? (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="date"
                    value={nouvelleDate}
                    onChange={(ev) => setNouvelleDate(ev.target.value)}
                    className="rounded border px-2 py-1 text-xs"
                  />
                  <button
                    onClick={() => enregistrerDate(e.id)}
                    className="rounded bg-black px-2 py-1 text-xs text-white"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => setEditionId(null)}
                    className="text-xs text-gray-500"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditionId(e.id);
                    setNouvelleDate(e.date_evenement);
                  }}
                  className="mt-0.5 text-xs text-gray-500 hover:underline"
                >
                  {formatDate(e.date_evenement)}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}