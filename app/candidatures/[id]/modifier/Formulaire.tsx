"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../supabase";

const STATUTS = ["À envoyer", "Envoyée", "Entretien RH", "Proposition", "Refus"];

type Candidature = {
  id: string;
  entreprise: string;
  poste: string;
  lieu: string | null;
  statut: string;
  date_envoi: string | null;
  salaire_min: number | null;
  salaire_max: number | null;
  url_offre: string | null;
  notes: string | null;
};

export default function Formulaire({ candidature }: { candidature: Candidature }) {
  const [entreprise, setEntreprise] = useState(candidature.entreprise);
  const [poste, setPoste] = useState(candidature.poste);
  const [lieu, setLieu] = useState(candidature.lieu ?? "");
  const [statut, setStatut] = useState(candidature.statut);
  const [dateEnvoi, setDateEnvoi] = useState(candidature.date_envoi ?? "");
  const [salaireMin, setSalaireMin] = useState(candidature.salaire_min?.toString() ?? "");
  const [salaireMax, setSalaireMax] = useState(candidature.salaire_max?.toString() ?? "");
  const [urlOffre, setUrlOffre] = useState(candidature.url_offre ?? "");
  const [notes, setNotes] = useState(candidature.notes ?? "");
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const retour = `/candidatures/${candidature.id}`;

  async function enregistrer() {
    if (!entreprise || !poste) {
      setErreur("Entreprise et poste sont obligatoires.");
      return;
    }

    setLoading(true);
    setErreur("");

    const supabase = createClient();
    const { error } = await supabase
      .from("candidatures")
      .update({
        entreprise,
        poste,
        lieu: lieu || null,
        statut,
        date_envoi: dateEnvoi || null,
        salaire_min: salaireMin ? Number(salaireMin) : null,
        salaire_max: salaireMax ? Number(salaireMax) : null,
        url_offre: urlOffre || null,
        notes: notes || null,
      })
      .eq("id", candidature.id);

    if (error) {
      setErreur(error.message);
      setLoading(false);
    } else {
      router.push(retour);
      router.refresh();
    }
  }

  const champ = "w-full rounded border px-3 py-2 text-sm";
  const label = "block text-sm font-medium text-gray-700";

  return (
    <div className="max-w-2xl">
      <Link href={retour} className="text-sm text-gray-500 hover:underline">
        Retour a la fiche
      </Link>

      <h1 className="mt-4 text-3xl font-bold">Modifier</h1>

      <div className="mt-6 space-y-4">
        <div>
          <label className={label}>Entreprise *</label>
          <input className={champ} value={entreprise} onChange={(e) => setEntreprise(e.target.value)} />
        </div>

        <div>
          <label className={label}>Poste *</label>
          <input className={champ} value={poste} onChange={(e) => setPoste(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Lieu</label>
            <input className={champ} value={lieu} onChange={(e) => setLieu(e.target.value)} />
          </div>
          <div>
            <label className={label}>Statut</label>
            <select className={champ} value={statut} onChange={(e) => setStatut(e.target.value)}>
              {STATUTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={label}>Date envoi</label>
          <input type="date" className={champ} value={dateEnvoi} onChange={(e) => setDateEnvoi(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Salaire min</label>
            <input type="number" className={champ} value={salaireMin} onChange={(e) => setSalaireMin(e.target.value)} />
          </div>
          <div>
            <label className={label}>Salaire max</label>
            <input type="number" className={champ} value={salaireMax} onChange={(e) => setSalaireMax(e.target.value)} />
          </div>
        </div>

        <div>
          <label className={label}>Lien vers offre</label>
          <input className={champ} value={urlOffre} onChange={(e) => setUrlOffre(e.target.value)} />
        </div>

        <div>
          <label className={label}>Notes</label>
          <textarea className={champ} rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {erreur && <p className="text-sm text-red-600">{erreur}</p>}

        <div className="flex gap-3">
          <button onClick={enregistrer} disabled={loading} className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50">
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
          <Link href={retour} className="rounded border px-4 py-2 text-sm">
            Annuler
          </Link>
        </div>
      </div>
    </div>
  );
}