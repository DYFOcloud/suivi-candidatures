"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../supabase";
import type { CandidatureOption } from "./Calendrier";

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

export default function NouvelEntretien({
  jour,
  candidatures,
}: {
  jour: string;
  candidatures: CandidatureOption[];
}) {
  const [ouvert, setOuvert] = useState(false);
  const [candidatureId, setCandidatureId] = useState("");
  const [etape, setEtape] = useState(ETAPES[2]);
  const [heure, setHeure] = useState("10:00");
  const [interlocuteur, setInterlocuteur] = useState("");
  const [format, setFormat] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  const router = useRouter();

  async function enregistrer() {
    if (!candidatureId) {
      setErreur("Sélectionnez une candidature.");
      return;
    }

    setLoading(true);
    setErreur("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("entretiens").insert({
      candidature_id: candidatureId,
      user_id: user.id,
      etape,
      date_entretien: `${jour}T${heure}:00`,
      interlocuteur: interlocuteur || null,
      format: format || null,
    });

    setLoading(false);

    if (error) {
      setErreur(error.message);
    } else {
      setOuvert(false);
      setCandidatureId("");
      setInterlocuteur("");
      setFormat("");
      router.refresh();
    }
  }

  const champ = "w-full rounded border px-3 py-2 text-sm";
  const label = "block text-xs font-medium text-gray-600";
    if (!ouvert) {
    return (
      <div className="px-4 py-3">
        <button
          onClick={() => setOuvert(true)}
          className="text-sm text-blue-600 hover:underline"
        >
          + Ajouter un entretien ce jour
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 bg-gray-50 px-4 py-4">
      <div>
        <label className={label}>Candidature</label>
        <select
          className={champ}
          value={candidatureId}
          onChange={(e) => setCandidatureId(e.target.value)}
        >
          <option value="">Sélectionner...</option>
          {candidatures.map((c) => (
            <option key={c.id} value={c.id}>
              {c.entreprise} — {c.poste}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className={label}>Étape</label>
          <select className={champ} value={etape} onChange={(e) => setEtape(e.target.value)}>
            {ETAPES.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Heure</label>
          <input
            type="time"
            className={champ}
            value={heure}
            onChange={(e) => setHeure(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className={label}>Interlocuteur</label>
          <input
            className={champ}
            value={interlocuteur}
            onChange={(e) => setInterlocuteur(e.target.value)}
            placeholder="Nom Prénom"
          />
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

      {erreur && <p className="text-sm text-red-600">{erreur}</p>}

      <div className="flex gap-2">
        <button
          onClick={enregistrer}
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {loading ? "Enregistrement..." : "Ajouter"}
        </button>
        <button
          onClick={() => {
            setOuvert(false);
            setErreur("");
          }}
          className="rounded border px-4 py-2 text-sm"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
