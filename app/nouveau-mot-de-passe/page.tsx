"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../supabase";

export default function NouveauMotDePasse() {
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const router = useRouter();

  async function enregistrer() {
    if (motDePasse.length < 8) {
      setErreur("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (motDePasse !== confirmation) {
      setErreur("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setErreur("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: motDePasse });

    setLoading(false);

    if (error) {
      setErreur(error.message);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-2xl font-bold">Nouveau mot de passe</h1>
      <p className="mt-2 text-sm text-gray-600">
        Choisissez un nouveau mot de passe pour votre compte.
      </p>

      <div className="mt-6 space-y-3">
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
        />
        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
        />

        {erreur && <p className="text-sm text-red-600">{erreur}</p>}

        <button
          onClick={enregistrer}
          disabled={loading}
          className="w-full rounded bg-black py-2 text-sm text-white disabled:opacity-50"
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </main>
  );
}
