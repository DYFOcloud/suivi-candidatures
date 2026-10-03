"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../supabase";

export default function Compte({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  const [confirme, setConfirme] = useState(false);
  const [saisie, setSaisie] = useState("");
  const [erreur, setErreur] = useState("");
  const router = useRouter();

  async function exporter() {
    setLoading(true);
    setErreur("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: candidatures } = await supabase
      .from("candidatures")
      .select("*");

    const { data: entretiens } = await supabase
      .from("entretiens")
      .select("*");

    const { data: historique } = await supabase
      .from("historique_statuts")
      .select("*");

    const donnees = {
      export_du: new Date().toISOString(),
      compte: { email: user.email, cree_le: user.created_at },
      candidatures: candidatures ?? [],
      entretiens: entretiens ?? [],
      historique_statuts: historique ?? [],
    };

    const blob = new Blob([JSON.stringify(donnees, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = `joply-export-${new Date().toISOString().slice(0, 10)}.json`;
    lien.click();
    URL.revokeObjectURL(url);

    setLoading(false);
  }

  async function supprimer() {
    if (saisie !== "SUPPRIMER") {
      setErreur("Saisissez SUPPRIMER pour confirmer.");
      return;
    }

    setLoading(true);
    setErreur("");

    try {
      const reponse = await fetch("/api/supprimer-compte", { method: "POST" });
      const donnees = await reponse.json();

      if (!reponse.ok) {
        setErreur(donnees.erreur ?? "Suppression impossible.");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setErreur("Erreur de connexion.");
      setLoading(false);
    }
  }
    return (
    <div className="max-w-2xl space-y-6">
      <section className="rounded-lg border">
        <h2 className="border-b px-5 py-3 font-semibold">Mon compte</h2>
        <div className="px-5 py-4 text-sm">
          <p className="text-gray-500">Adresse email</p>
          <p className="mt-1 font-medium">{email}</p>
        </div>
      </section>

      <section className="rounded-lg border">
        <h2 className="border-b px-5 py-3 font-semibold">Mes données</h2>
        <div className="px-5 py-4">
          <p className="text-sm text-gray-600">
            Téléchargez l&apos;ensemble de vos candidatures, entretiens et
            historique dans un fichier lisible.
          </p>
          <button
            onClick={exporter}
            disabled={loading}
            className="mt-3 rounded border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Export en cours..." : "Exporter mes données"}
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-red-200">
        <h2 className="border-b border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-900">
          Supprimer mon compte
        </h2>
        <div className="px-5 py-4">
          {!confirme ? (
            <div>
              <p className="text-sm text-gray-600">
                La suppression est définitive. Vos candidatures, entretiens et
                documents seront effacés immédiatement et ne pourront pas être
                récupérés.
              </p>
              <button
                onClick={() => setConfirme(true)}
                className="mt-3 rounded border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Supprimer mon compte
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-700">
                Pour confirmer, saisissez <strong>SUPPRIMER</strong> ci-dessous.
              </p>
              <input
                value={saisie}
                onChange={(e) => setSaisie(e.target.value)}
                className="mt-2 w-48 rounded border px-3 py-2 text-sm"
                placeholder="SUPPRIMER"
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={supprimer}
                  disabled={loading}
                  className="rounded bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {loading ? "Suppression..." : "Confirmer la suppression"}
                </button>
                <button
                  onClick={() => {
                    setConfirme(false);
                    setSaisie("");
                    setErreur("");
                  }}
                  className="rounded border px-4 py-2 text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
          {erreur && <p className="mt-2 text-sm text-red-600">{erreur}</p>}
        </div>
      </section>
    </div>
  );
}
