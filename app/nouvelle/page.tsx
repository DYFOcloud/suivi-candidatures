"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../supabase";

const STATUTS = ["À envoyer", "Envoyée", "Entretien RH", "Proposition", "Refus"];

export default function Nouvelle() {
  const [entreprise, setEntreprise] = useState("");
  const [poste, setPoste] = useState("");
  const [lieu, setLieu] = useState("");
  const [statut, setStatut] = useState("À envoyer");
  const [dateEnvoi, setDateEnvoi] = useState("");
  const [salaireMin, setSalaireMin] = useState("");
  const [salaireMax, setSalaireMax] = useState("");
  const [urlOffre, setUrlOffre] = useState("");
  const [notes, setNotes] = useState("");
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit() {
    if (!entreprise || !poste) {
      setErreur("Entreprise et poste sont obligatoires.");
      return;
    }

    setLoading(true);
    setErreur("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("candidatures").insert({
      user_id: user.id,
      entreprise,
      poste,
      lieu: lieu || null,
      statut,
      date_envoi: dateEnvoi || null,
      salaire_min: salaireMin ? Number(salaireMin) : null,
      salaire_max: salaireMax ? Number(salaireMax) : null,
      url_offre: urlOffre || null,
      notes: notes || null,
    });

    if (error) {
      setErreur(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  const champ = "w-full rounded border px-3 py-2 text-sm";
  const label = "block text-sm font-medium text-gray-700";

  return (
    <main className="mx-auto max-w-2xl p-10">
      <h1 className="text-2xl font-bold">Nouvelle candidature</h1>

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
          <label className={label}>Date d&apos;envoi</label>
          <input type="date" className={champ} value={dateEnvoi} onChange={(e) => setDateEnvoi(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Salaire min (€)</label>
            <input type="number" className={champ} value={salaireMin} onChange={(e) => setSalaireMin(e.target.value)} />
          </div>
          <div>
            <label className={label}>Salaire max (€)</label>
            <input type="number" className={champ} value={salaireMax} onChange={(e) => setSalaireMax(e.target.value)} />
          </div>
        </div>

        <div>
          <label className={label}>Lien vers l&apos;offre</label>
          <input className={champ} placeholder="https://..." value={urlOffre} onChange={(e) => setUrlOffre(e.target.value)} />
        </div>

        <div>
          <label className={label}>Notes</label>
          <textarea className={champ} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {erreur && <p className="text-sm text-red-600">{erreur}</p>}

        <div className="flex gap-3">
          <button onClick={handleSubmit} disabled={loading} className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50">
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button onClick={() => router.push("/")} className="rounded border px-4 py-2 text-sm">
            Annuler
          </button>
        </div>
      </div>
    </main>
  );
}
