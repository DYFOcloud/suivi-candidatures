"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../supabase";
import type { CandidatureOption, EntretienAgenda } from "./Calendrier";

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

export default function ModifierEntretien({
  entretien,
  candidatures,
  onFini,
}: {
  entretien: EntretienAgenda;
  candidatures: CandidatureOption[];
  onFini: () => void;
}) {
  const d = entretien.date_entretien ? new Date(entretien.date_entretien) : new Date();

  const dateInitiale = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const heureInitiale = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  const [candidatureId, setCandidatureId] = useState(entretien.candidature_id);
  const [etape, setEtape] = useState(entretien.etape);
  const [date, setDate] = useState(dateInitiale);
  const [heure, setHeure] = useState(heureInitiale);
  const [interlocuteur, setInterlocuteur] = useState(entretien.interlocuteur ?? "");
  const [format, setFormat] = useState(entretien.format ?? "");
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

    const [annee, mois, jourNum] = date.split("-").map(Number);
    const [h, m] = heure.split(":").map(Number);
    const dateLocale = new Date(annee, mois - 1, jourNum, h, m, 0);

    const supabase = createClient();
    const { error } = await supabase
      .from("entretiens")
      .update({
        candidature_id: candidatureId,
        etape,
        date_entretien: dateLocale.toISOString(),
        interlocuteur: interlocuteur || null,
        format: format || null,
      })
      .eq("id", entretien.id);

    setLoading(false);

    if (error) {
      setErreur(error.message);
    } else {
      onFini();
      router.refresh();
    }
  }

  const champ = "w-full rounded border px-3 py-2 text-sm";
  const label = "block text-xs font-medium text-gray-600";
    return (
    <div className="space-y-3 rounded bg-gray-50 p-3">
      <div>
        <label className={label}>Candidature</label>
        <select
          className={champ}
          value={candidatureId}
          onChange={(e) => setCandidatureId(e.target.value)}
        >
          {candidatures.map((c) => (
            <option key={c.id} value={c.id}>
              {c.entreprise} — {c.poste}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className={label}>Date</label>
          <input
            type="date"
            className={champ}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
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

      <div>
        <label className={label}>Étape</label>
        <select className={champ} value={etape} onChange={(e) => setEtape(e.target.value)}>
          {ETAPES.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
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
          className="rounded bg-black px-4 py-1.5 text-sm text-white disabled:opacity-50"
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button onClick={onFini} className="rounded border bg-white px-4 py-1.5 text-sm">
          Annuler
        </button>
      </div>
    </div>
  );
}
