"use client";

import { useEffect, useRef } from "react";

export default function ReceptionBookmarklet({
  onTexte,
}: {
  onTexte: (texte: string, url: string) => void;
}) {
  const traite = useRef(false);

  useEffect(() => {
    if (traite.current) return;

    function recevoir(event: MessageEvent) {
      if (event.origin !== window.location.origin && event.data?.source !== "joply") {
        return;
      }
      if (event.data?.type === "joply-offre" && event.data.texte) {
        traite.current = true;
        onTexte(event.data.texte, event.data.url ?? "");
      }
    }

    window.addEventListener("message", recevoir);

    const stocke = sessionStorage.getItem("joply-offre");
    if (stocke) {
      try {
        const donnees = JSON.parse(stocke);
        sessionStorage.removeItem("joply-offre");
        traite.current = true;
        onTexte(donnees.texte, donnees.url ?? "");
      } catch {
        sessionStorage.removeItem("joply-offre");
      }
    }

    return () => window.removeEventListener("message", recevoir);
  }, [onTexte]);

  return null;
}
