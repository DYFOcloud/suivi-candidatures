"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../supabase";

export default function MotDePasseOublie() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState("");

  async function envoyer() {
    if (!email) {
      setErreur("Saisissez votre adresse email.");
      return;
    }

    setLoading(true);
    setErreur("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nouveau-mot-de-passe`,
    });

    setLoading(false);

    if (error) {
      setErreur(error.message);
    } else {
      setEnvoye(true);
    }
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-2xl font-bold">Mot de passe oublié</h1>

      {envoye ? (
        <div className="mt-6">
          <p className="text-sm text-gray-700">
            Si un compte existe avec cette adresse, vous recevrez un email
            contenant un lien pour définir un nouveau mot de passe.
          </p>
          <p className="mt-3 text-xs text-gray-500">
            Pensez à vérifier vos spams.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm text-blue-600 hover:underline"
          >
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-gray-600">
            Saisissez votre adresse email. Vous recevrez un lien pour définir un
            nouveau mot de passe.
          </p>

          <input
            type="email"
            placeholder="email@exemple.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          />

          {erreur && <p className="text-sm text-red-600">{erreur}</p>}

          <button
            onClick={envoyer}
            disabled={loading}
            className="w-full rounded bg-black py-2 text-sm text-white disabled:opacity-50"
          >
            {loading ? "Envoi..." : "Envoyer le lien"}
          </button>

          <Link
            href="/login"
            className="block text-center text-xs text-gray-500 hover:underline"
          >
            Retour à la connexion
          </Link>
        </div>
      )}
    </main>
  );
}
