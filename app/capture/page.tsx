"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Capture() {
  const [etat, setEtat] = useState<"attente" | "ok" | "erreur">("attente");
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const texte = params.get("t");
    const url = params.get("u") ?? "";

    if (!texte || texte.length < 50) {
      setEtat("erreur");
      return;
    }

    try {
      sessionStorage.setItem(
        "joply-offre",
        JSON.stringify({ texte: decodeURIComponent(texte), url: decodeURIComponent(url) })
      );
      setEtat("ok");
      router.replace("/nouvelle");
    } catch {
      setEtat("erreur");
    }
  }, [router]);

  return (
    <main className="mx-auto max-w-md px-6 py-20 text-center">
      {etat === "attente" && (
        <p className="text-sm text-gray-600">Récupération de l&apos;offre...</p>
      )}
      {etat === "ok" && (
        <p className="text-sm text-gray-600">Offre récupérée, redirection...</p>
      )}
      {etat === "erreur" && (
        <div>
          <p className="text-sm text-gray-700">
            Impossible de récupérer le texte de l&apos;offre.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            La page était peut-être trop courte, ou le contenu n&apos;a pas pu
            être lu. Utilisez le copier-coller depuis le formulaire.
          </p>
          <a
            href="/nouvelle"
            className="mt-4 inline-block rounded bg-black px-4 py-2 text-sm text-white"
          >
            Créer une candidature
          </a>
        </div>
      )}
    </main>
  );
}
