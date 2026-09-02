"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../supabase";
import Preparation, { Prep } from "./Preparation";

const ETAPES = [
  "Cabinet de recrutement",
  "Préqualification RH",
  "Entretien RH",
  "Entretien manager",
  "Entretien équipe",
  "Entretien N+2 / direction",
  "Test technique / étude de cas",
  "Entretien final",
  "Autre",
];

const FORMATS = ["Visio", "Téléphone", "Sur site", "Autre"];

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

export default function Entretiens({
  candidatureId,
  entretiens,
}: {
  candidatureId: string;
  entretiens: Entretien[];
}) {
  const [formOuvert, setFormOuvert] = useState(false);
  const [editionId, setEditionId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [prepId, setPrepId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [etape, setEtape] = useState(ETAPES[2]);
  const [dateEntretien, setDateEntretien] = useState("");
  const [interlocuteur, setInterlocuteur] = useState("");
  const [emailContact, setEmailContact] = useState("");
  const [telephoneContact, setTelephoneContact] = useState("");
  const [format, setFormat] = useState("");
  const [questionsPosees, setQuestionsPosees] = useState("");
  const [notes, setNotes] = useState("");
  const [ressenti, setRessenti] = useState("");

  const router = useRouter();

  function reset() {
    setEtape(ETAPES[2]);
    setDateEntretien("");
    setInterlocuteur("");
    setEmailContact("");
    setTelephoneContact("");
    setFormat("");
    setQuestionsPosees("");
    setNotes("");
    setRessenti("");
    setEditionId(null);
    setFormOuvert(false);
  }

  function ouvrirEdition(e: Entretien) {
    setEtape(e.etape);
    setDateEntretien(e.date_entretien ? e.date_entretien.slice(0, 16) : "");
    setInterlocuteur(e.interlocuteur ?? "");
    setEmailContact(e.email_contact ?? "");
    setTelephoneContact(e.telephone_contact ?? "");
    setFormat(e.format ?? "");
    setQuestionsPosees(e.questions_posees ?? "");
    setNotes(e.notes ?? "");
    setRessenti(e.ressenti ?? "");
    setEditionId(e.id);
    setFormOuvert(true);
  }

  async function enregistrer() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const donnees = {
      candidature_id: candidatureId,
      user_id: user.id,
      etape,
      date_entretien: dateEntretien || null,
      interlocuteur: interlocuteur || null,
      email_contact: emailContact || null,
      telephone_contact: telephoneContact || null,
      format: format || null,
      questions_posees: questionsPosees || null,
      notes: notes || null,
      ressenti: ressenti || null,
    };

    if (editionId) {
      await supabase.from("entretiens").update(donnees).eq("id", editionId);
    } else {
      await supabase.from("entretiens").insert(donnees);
    }

    setLoading(false);
    reset();
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
      <div className="flex items-center justify-between border-b px-5 py-3">
        <h2 className="font-semibold">Entretiens</h2>
        {!formOuvert && (
          <button
            onClick={() => setFormOuvert(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            + Ajouter
          </button>
        )}
      </div>

      {formOuvert && (
        <div className="space-y-3 border-b bg-gray-50 p-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Étape</label>
              <select className={champ} value={etape} onChange={(e) => setEtape(e.target.value)}>
                {ETAPES.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Date et heure</label>
              <input type="datetime-local" className={champ} value={dateEntretien} onChange={(e) => setDateEntretien(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Interlocuteur</label>
              <input className={champ} value={interlocuteur} onChange={(e) => setInterlocuteur(e.target.value)} placeholder="Nom Prénom" />
            </div>
            <div>
              <label className={label}>Format</label>
              <select className={champ} value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="">—</option>
                {FORMATS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Email</label>
              <input className={champ} value={emailContact} onChange={(e) => setEmailContact(e.target.value)} />
            </div>
            <div>
              <label className={label}>Téléphone</label>
              <input className={champ} value={telephoneContact} onChange={(e) => setTelephoneContact(e.target.value)} />
            </div>
          </div>

          <div>
            <label className={label}>Questions posées</label>
            <textarea className={champ} rows={3} value={questionsPosees} onChange={(e) => setQuestionsPosees(e.target.value)} />
          </div>

          <div>
            <label className={label}>Notes</label>
            <textarea className={champ} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div>
            <label className={label}>Ressenti</label>
            <input className={champ} value={ressenti} onChange={(e) => setRessenti(e.target.value)} placeholder="Bon échange, ambiance..." />
          </div>

          <div className="flex gap-2">
            <button onClick={enregistrer} disabled={loading} className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50">
              {loading ? "Enregistrement..." : editionId ? "Modifier" : "Ajouter"}
            </button>
            <button onClick={reset} className="rounded border px-4 py-2 text-sm">
              Annuler
            </button>
          </div>
        </div>
      )}
            {entretiens.length === 0 && !formOuvert ? (
        <p className="px-5 py-6 text-sm text-gray-400">Aucun entretien enregistré.</p>
      ) : (
        <ul className="divide-y">
          {entretiens.map((e) => (
            <li key={e.id} className="px-5 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{e.etape}</p>
                  <p className="text-xs text-gray-500">
                    {formatDateHeure(e.date_entretien)}
                    {e.interlocuteur && ` · ${e.interlocuteur}`}
                    {e.format && ` · ${e.format}`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2 text-xs">
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
                    {detailId === e.id ? "Réduire" : "Détails"}
                  </button>
                  <button onClick={() => ouvrirEdition(e)} className="text-blue-600 hover:underline">
                    Modifier
                  </button>
                  <button onClick={() => supprimer(e.id)} className="text-red-600 hover:underline">
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
                <div className="mt-3 space-y-3 rounded bg-gray-50 p-3 text-sm">
                  {(e.email_contact || e.telephone_contact) && (
                    <p className="text-xs text-gray-600">
                      {e.email_contact}
                      {e.email_contact && e.telephone_contact && " · "}
                      {e.telephone_contact}
                    </p>
                  )}
                  {e.questions_posees && (
                    <div>
                      <p className="text-xs font-medium text-gray-600">Questions posées</p>
                      <p className="mt-1 whitespace-pre-wrap text-gray-700">{e.questions_posees}</p>
                    </div>
                  )}
                  {e.notes && (
                    <div>
                      <p className="text-xs font-medium text-gray-600">Notes</p>
                      <p className="mt-1 whitespace-pre-wrap text-gray-700">{e.notes}</p>
                    </div>
                  )}
                  {e.ressenti && (
                    <div>
                      <p className="text-xs font-medium text-gray-600">Ressenti</p>
                      <p className="mt-1 text-gray-700">{e.ressenti}</p>
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
