"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../supabase";
import Preparation, { Prep } from "./Preparation";

export type Entretien = {
  id: string;
  etape: string;
  date_entretien: string | null;
  interlocuteur: string | null;
  email_contact: string | null;
  telephone_contact: string | null;
  format: string | null;
  questions_posees: string | null;
  notes: string | null;
  ressenti: string | null;
  preparation_json: Prep | null;
  preparation_langue: string | null;
};

function formatDateHeure(d: string | null) {
  if (!d) return "Date à définir";
  return new Date(d).toLocaleString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function estFutur(d: string | null) {
  if (!d) return false;
  return new Date(d).getTime() >= Date.now();
}

export default function Entretiens({
  entretiens,
}: {
  candidatureId: string;
  entretiens: Entretien[];
}) {
  const [detailId, setDetailId] = useState<string | null>(null);
  const [prepId, setPrepId] = useState<string | null>(null);
  const [editionId, setEditionId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [questions, setQuestions] = useState("");
  const [ressenti, setRessenti] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  function ouvrirEdition(e: Entretien) {
    setNotes(e.notes ?? "");
    setQuestions(e.questions_posees ?? "");
    setRessenti(e.ressenti ?? "");
    setEditionId(e.id);
  }

  async function enregistrer(id: string) {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("entretiens")
      .update({
        notes: notes || null,
        questions_posees: questions || null,
        ressenti: ressenti || null,
      })
      .eq("id", id);
    setLoading(false);
    setEditionId(null);
    router.refresh();
  }

  async function supprimer(id: string) {
    const supabase = createClient();
    await supabase.from("entretiens").delete().eq("id", id);
    router.refresh();
  }

  const champ = "w-full rounded border px-3 py-2 text-sm";
  const label = "block text-xs font-medium text-gray-600";
    return (
    <section className="rounded-lg border">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="font-semibold">Entretiens</h2>
        <Link href="/agenda" className="text-sm text-blue-600 hover:underline">
          Planifier depuis l&apos;agenda
        </Link>
      </div>

      {entretiens.length === 0 ? (
        <p className="px-4 py-6 text-sm text-gray-400">
          Aucun entretien programmé.
        </p>
      ) : (
        <ul className="divide-y">
          {entretiens.map((e) => (
            <li key={e.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{e.etape}</p>
                  <p
                    className={`text-xs ${
                      estFutur(e.date_entretien)
                        ? "font-medium text-violet-700"
                        : "text-gray-500"
                    }`}
                  >
                    {estFutur(e.date_entretien) && "Programmé le "}
                    {formatDateHeure(e.date_entretien)}
                    {e.interlocuteur && ` · ${e.interlocuteur}`}
                    {e.format && ` · ${e.format}`}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-2 text-xs">
                  <button
                    onClick={() => setPrepId(prepId === e.id ? null : e.id)}
                    className="font-medium text-violet-700 hover:underline"
                  >
                    {prepId === e.id ? "Fermer" : "Préparer"}
                  </button>
                  <button
                    onClick={() => setDetailId(detailId === e.id ? null : e.id)}
                    className="text-gray-500 hover:underline"
                  >
                    {detailId === e.id ? "Réduire" : "Notes"}
                  </button>
                  <button
                    onClick={() => supprimer(e.id)}
                    className="text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {prepId === e.id && (
                <Preparation
                  entretienId={e.id}
                  etape={e.etape}
                  prepInitiale={e.preparation_json}
                  langueInitiale={e.preparation_langue}
                />
              )}

              {detailId === e.id && (
                <div className="mt-3 rounded bg-gray-50 p-3">
                  {editionId === e.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className={label}>Questions posées</label>
                        <textarea
                          className={champ}
                          rows={3}
                          value={questions}
                          onChange={(ev) => setQuestions(ev.target.value)}
                        />
                      </div>
                      <div>
                        <label className={label}>Notes</label>
                        <textarea
                          className={champ}
                          rows={3}
                          value={notes}
                          onChange={(ev) => setNotes(ev.target.value)}
                        />
                      </div>
                      <div>
                        <label className={label}>Ressenti</label>
                        <input
                          className={champ}
                          value={ressenti}
                          onChange={(ev) => setRessenti(ev.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => enregistrer(e.id)}
                          disabled={loading}
                          className="rounded bg-black px-3 py-1.5 text-xs text-white disabled:opacity-50"
                        >
                          {loading ? "..." : "Enregistrer"}
                        </button>
                        <button
                          onClick={() => setEditionId(null)}
                          className="rounded border px-3 py-1.5 text-xs"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      {e.questions_posees && (
                        <div>
                          <p className="text-xs font-medium text-gray-600">Questions posées</p>
                          <p className="mt-0.5 whitespace-pre-wrap text-gray-700">{e.questions_posees}</p>
                        </div>
                      )}
                      {e.notes && (
                        <div>
                          <p className="text-xs font-medium text-gray-600">Notes</p>
                          <p className="mt-0.5 whitespace-pre-wrap text-gray-700">{e.notes}</p>
                        </div>
                      )}
                      {e.ressenti && (
                        <div>
                          <p className="text-xs font-medium text-gray-600">Ressenti</p>
                          <p className="mt-0.5 text-gray-700">{e.ressenti}</p>
                        </div>
                      )}
                      <button
                        onClick={() => ouvrirEdition(e)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {e.notes || e.questions_posees || e.ressenti
                          ? "Modifier"
                          : "Ajouter des notes"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
