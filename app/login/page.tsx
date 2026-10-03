"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepte, setAccepte] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"connexion" | "inscription">("connexion");
  const router = useRouter();
  const supabase = createClient();

  async function handleSignUp() {
    if (!accepte) {
      setMessage("Vous devez accepter la politique de confidentialité.");
      return;
    }

    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage(error.message);
    else setMessage("Compte créé. Vérifiez votre email pour le confirmer.");
    setLoading(false);
  }

  async function handleSignIn() {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }
    return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-2xl font-bold">Joply</h1>
      <p className="mt-1 text-sm text-gray-600">
        {mode === "connexion" ? "Connectez-vous" : "Créez votre compte"}
      </p>

      <div className="mt-8 space-y-3">
        <input
          type="email"
          placeholder="email@exemple.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
        />
        <input
          type="password"
          placeholder="mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
        />

        {mode === "connexion" && (
          <div className="text-right">
            <Link
              href="/mot-de-passe-oublie"
              className="text-xs text-gray-500 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        )}

        {mode === "inscription" && (
          <label className="flex items-start gap-2 pt-1 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={accepte}
              onChange={(e) => setAccepte(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              J&apos;ai lu et j&apos;accepte la{" "}
              <Link href="/confidentialite" className="text-blue-600 hover:underline">
                politique de confidentialité
              </Link>{" "}
              et les{" "}
              <Link href="/mentions-legales" className="text-blue-600 hover:underline">
                mentions légales
              </Link>
              .
            </span>
          </label>
        )}

        <button
          onClick={mode === "connexion" ? handleSignIn : handleSignUp}
          disabled={loading}
          className="w-full rounded bg-black py-2 text-sm text-white disabled:opacity-50"
        >
          {loading ? "..." : mode === "connexion" ? "Se connecter" : "Créer mon compte"}
        </button>

        <button
          onClick={() => {
            setMode(mode === "connexion" ? "inscription" : "connexion");
            setMessage("");
          }}
          className="w-full text-xs text-gray-500 hover:underline"
        >
          {mode === "connexion"
            ? "Pas encore de compte ? Créer un compte"
            : "Déjà un compte ? Se connecter"}
        </button>
      </div>

      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </main>
  );
}
