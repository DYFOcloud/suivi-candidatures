"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../supabase";

const TYPES_OK = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function Documents({
  userId,
  cvPath,
}: {
  userId: string;
  cvPath: string | null;
}) {
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);
  const router = useRouter();

  const cvEstPdf = cvPath?.toLowerCase().endsWith(".pdf") ?? false;

  async function upload(fichier: File) {
    setErreur("");

    if (!TYPES_OK.includes(fichier.type)) {
      setErreur("Format non accepté. Utilisez PDF ou Word.");
      return;
    }

    if (fichier.size > 5 * 1024 * 1024) {
      setErreur("Fichier trop volumineux (5 Mo maximum).");
      return;
    }

    setEnCours(true);

    const supabase = createClient();
    const extension = fichier.name.split(".").pop();
    const chemin = `${userId}/reference-cv.${extension}`;

    const { error: erreurUpload } = await supabase.storage
      .from("documents")
      .upload(chemin, fichier, { upsert: true });

    if (erreurUpload) {
      setErreur(erreurUpload.message);
      setEnCours(false);
      return;
    }

    await supabase.from("profils").upsert({
      id: userId,
      cv_reference_path: chemin,
      updated_at: new Date().toISOString(),
    });

    setEnCours(false);
    router.refresh();
  }

  async function telecharger(chemin: string) {
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("documents")
      .createSignedUrl(chemin, 60);

    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  async function supprimer(chemin: string) {
    const supabase = createClient();
    await supabase.storage.from("documents").remove([chemin]);

    await supabase.from("profils").upsert({
      id: userId,
      cv_reference_path: null,
      updated_at: new Date().toISOString(),
    });

    router.refresh();
  }
    return (
    <section className="rounded-lg border">
      <div className="border-b px-4 py-3">
        <h2 className="font-semibold">CV de référence</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Réutilisable en un clic sur chaque candidature
        </p>
      </div>

      <div className="px-4 py-4">
        {cvPath ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-700">
              {cvPath.split("/").pop()}
            </span>
            <button
              onClick={() => telecharger(cvPath)}
              className="text-sm text-blue-600 hover:underline"
            >
              Ouvrir
            </button>
            <label className="cursor-pointer text-sm text-blue-600 hover:underline">
              Remplacer
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f);
                }}
              />
            </label>
            <button
              onClick={() => supprimer(cvPath)}
              className="text-sm text-red-600 hover:underline"
            >
              Retirer
            </button>
          </div>
        ) : (
          <label className="inline-block cursor-pointer rounded bg-black px-4 py-2 text-sm text-white">
            {enCours ? "Envoi..." : "Téléverser mon CV"}
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
              }}
            />
          </label>
        )}

        {cvPath && !cvEstPdf && (
          <p className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Votre CV est au format Word. L&apos;analyse de correspondance et la
            préparation d&apos;entretien nécessitent un PDF.
          </p>
        )}

        {erreur && <p className="mt-2 text-sm text-red-600">{erreur}</p>}
      </div>
    </section>
  );
}
