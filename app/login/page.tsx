"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignUp() {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage(error.message);
    else setMessage("Compte créé, tu peux te connecter.");
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
    <main className="mx-auto max-w-sm p-10">
      <h1 className="text-2xl font-bold">Connexion</h1>

      <div className="mt-6 space-y-3">
        <input
          type="email"
          placeholder="email@exemple.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
        <input
          type="password"
          placeholder="mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
        >
          Se connecter
        </button>

        <button
          onClick={handleSignUp}
          disabled={loading}
          className="w-full rounded border py-2 disabled:opacity-50"
        >
          Créer un compte
        </button>
      </div>

      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </main>
  );
}
