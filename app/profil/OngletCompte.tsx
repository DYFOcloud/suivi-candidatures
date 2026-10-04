"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../supabase";

export default function OngletCompte({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  const [formMdp, setFormMdp] = useState(false);
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [confirmMdp, setConfirmMdp] = useState("");

  const [formEmail, setFormEmail] = useState(false);
  const [nouvelEmail, setNouvelEmail] = useState("");

  const [confirmeSuppression, setConfirmeSuppression] = useState(false);
  const [saisie, setSaisie] = useState("");

  const router = useRouter();

  async function changerMotDePasse() {
    if (nouveauMdp.length < 8) {
      setErreur("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (nouveauMdp !== confirmMdp) {
      setErreur("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setErreur("");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: nouveauMdp });

    setLoading(false);

    if (error) {
      setErreur(error.message);
    } else {
      setMessage("Mot de passe modifié.");
      setFormMdp(false);
      setNouveauMdp("");
      setConfirmMdp("");
    }
  }

  async function changerEmail() {
    if (!nouvelEmail.includes("@")) {
      setErreur("Adresse email invalide.");
      return;
    }

    setLoading(true);
    setErreur("");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: nouvelEmail });

    setLoading(false);

    if (error) {
      setErreur(error.message);
    } else {
      setMessage("Un email de confirmation a été envoyé à votre nouvelle adresse.");
      setFormEmail(false);
      setNouvelEmail("");
    }
  }

  async function supprimerCompte() {
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

  const champ = "w-full rounded border px-3 py-2 text-sm";
    return (
    <div className="max-w-2xl space-y-4">
      {message && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
          {message}
        </p>
      )}

      <section className="rounded-lg border">
        <h2 className="border-b px-4 py-3 font-semibold">Identifiants</h2>

        <div className="divide-y">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Adresse email</p>
                <p className="truncate text-sm font-medium">{email}</p>
              </div>
              {!formEmail && (
                <button
                  onClick={() => setFormEmail(true)}
                  className="shrink-0 text-sm text-blue-600 hover:underline"
                >
                  Modifier
                </button>
              )}
            </div>

            {formEmail && (
              <div className="mt-3 space-y-2">
                <input
                  type="email"
                  className={champ}
                  value={nouvelEmail}
                  onChange={(e) => setNouvelEmail(e.target.value)}
                  placeholder="nouvelle@adresse.fr"
                />
                <div className="flex gap-2">
                  <button
                    onClick={changerEmail}
                    disabled={loading}
                    className="rounded bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50"
                  >
                    Confirmer
                  </button>
                  <button
                    onClick={() => {
                      setFormEmail(false);
                      setErreur("");
                    }}
                    className="rounded border px-3 py-1.5 text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-gray-500">Mot de passe</p>
                <p className="text-sm font-medium">••••••••</p>
              </div>
              {!formMdp && (
                <button
                  onClick={() => setFormMdp(true)}
                  className="shrink-0 text-sm text-blue-600 hover:underline"
                >
                  Modifier
                </button>
              )}
            </div>

            {formMdp && (
              <div className="mt-3 space-y-2">
                <input
                  type="password"
                  className={champ}
                  value={nouveauMdp}
                  onChange={(e) => setNouveauMdp(e.target.value)}
                  placeholder="Nouveau mot de passe"
                />
                <input
                  type="password"
                  className={champ}
                  value={confirmMdp}
                  onChange={(e) => setConfirmMdp(e.target.value)}
                  placeholder="Confirmer"
                />
                <div className="flex gap-2">
                  <button
                    onClick={changerMotDePasse}
                    disabled={loading}
                    className="rounded bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => {
                      setFormMdp(false);
                      setErreur("");
                    }}
                    className="rounded border px-3 py-1.5 text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border">
        <h2 className="border-b px-4 py-3 font-semibold">Mon abonnement</h2>
        <div className="px-4 py-4">
          <p className="text-sm text-gray-600">
            Vous utilisez actuellement la version gratuite de Joply.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Les formules payantes seront disponibles prochainement.
          </p>
        </div>
      </section>

      <section className="rounded-lg border">
        <h2 className="border-b px-4 py-3 font-semibold">Moyen de paiement</h2>
        <div className="px-4 py-4">
          <p className="text-sm text-gray-400">
            Aucun moyen de paiement enregistré.
          </p>
        </div>
      </section>

      <section className="rounded-lg border">
        <h2 className="border-b px-4 py-3 font-semibold">Historique de paiement</h2>
        <div className="px-4 py-4">
          <p className="text-sm text-gray-400">Aucun paiement à ce jour.</p>
        </div>
      </section>

      <section className="rounded-lg border">
        <h2 className="border-b px-4 py-3 font-semibold">Rapport</h2>
        <div className="px-4 py-4">
          <p className="text-sm text-gray-600">
            Générez un récapitulatif de vos candidatures et entretiens, prêt à
            imprimer ou à enregistrer en PDF.
          </p>
          <Link
            href="/rapport"
            className="mt-3 inline-block rounded bg-black px-4 py-2 text-sm text-white"
          >
            Générer mon rapport
          </Link>
        </div>
      </section>
            <section className="rounded-lg border border-red-200">
        <h2 className="border-b border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-900">
          Supprimer mon compte
        </h2>
        <div className="px-4 py-4">
          {!confirmeSuppression ? (
            <div>
              <p className="text-sm text-gray-600">
                La suppression est définitive. Vos candidatures, entretiens et
                documents seront effacés immédiatement et ne pourront pas être
                récupérés.
              </p>
              <button
                onClick={() => setConfirmeSuppression(true)}
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
                  onClick={supprimerCompte}
                  disabled={loading}
                  className="rounded bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {loading ? "Suppression..." : "Confirmer la suppression"}
                </button>
                <button
                  onClick={() => {
                    setConfirmeSuppression(false);
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
        </div>
      </section>

      {erreur && <p className="text-sm text-red-600">{erreur}</p>}
    </div>
  );
}
