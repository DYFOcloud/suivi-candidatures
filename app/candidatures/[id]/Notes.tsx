"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../supabase";

export default function Notes({
  id,
  notesInitiales,
}: {
  id: string;
  notesInitiales: string | null;
}) {
  const [notes, setNotes] = useState(notesInitiales ?? "");
  const [edition, setEdition] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function enregistrer() {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("candidatures")
      .update({ notes: notes || null })
      .eq("id", id);
    setLoading(false);
    setEdition(false);
    router.refresh();
  }

  return (
    <section className="rounded-lg border">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="font-semibold">Notes</h2>
        {!edition && (
          <button
            onClick={() => setEdition(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            {notesInitiales ? "Modifier" : "Ajouter"}
          </button>
        )}
      </div>

      {edition ? (
        <div className="px-4 py-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={8}
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="Vos notes sur l'entreprise, le poste, vos échanges..."
            autoFocus
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={enregistrer}
              disabled={loading}
              className="rounded bg-black px-4 py-1.5 text-sm text-white disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              onClick={() => {
                setNotes(notesInitiales ?? "");
                setEdition(false);
              }}
              className="rounded border px-4 py-1.5 text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-wrap px-4 py-3 text-sm text-gray-700">
          {notesInitiales || (
            <span className="text-gray-400">Aucune note.</span>
          )}
        </p>
      )}
    </section>
  );
}
