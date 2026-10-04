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
  lmPath,
}: {
  userId: string;
  cvPath: string | null;
  lmPath: string | null;
}) {
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState("");
  const router = useRouter();

  const cvEstPdf = cvPath?.toLowerCase().endsWith(".pdf") ?? false;

  async function upload(fichier: File, type: "cv" | "lm") {
    setErreur("");

    if (!TYPES_OK.includes(fichier.type)) {
      setErreur("Format non accepté. Utilisez PDF ou Word.");
      return;
    }

    if (fichier.size > 5 * 1024 * 1024) {
      setErreur("Fichier trop volumineux (5 Mo maximum).");
      return;
    }

    setEnCours(type);

    const supabase = createClient();
    const extension = fichier.name.split(".").pop();
    const chemin = `${userId}/reference-${type}.${extension}`;

    const { error: erreurUpload } = await supabase.storage
      .from("documents")
      .upload(chemin, fichier, { upsert: true });

    if (erreurUpload) {
      setErreur(erreurUpload.message);
      setEnCours("");
      return;
    }

    const colonne = type === "cv" ? "cv_reference_path" : "lm_reference_path";
    await supabase.from("profils").upsert({
      id: userId,
      [colonne]: chemin,
      updated_at: new Date().toISOString(),
    });

    setEnCours("");
    router.refresh();
  }

  async function telecharger(chemin: string) {
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("documents")
      .createSignedUrl(chemin, 60);

    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  async function supprimer(chemin: string, type: "cv" | "lm") {
    const supabase = createClient();
    await supabase.storage.from("documents").remove([chemin]);

    const colonne = type === "cv" ? "cv_reference_path" : "lm_reference_path";
    await supabase.from("profils").upsert({
      id: userId,
      [colonne]: null,
      updated_at: new Date().toISOString(),
    });

    router.refresh();
  }
    function Bloc({
    titre,
    description,
    chemin,
    type,
  }: {
    titre: string;
    description: string;
    chemin: string | null;
    type: "cv" | "lm";
  }) {
    return (
      <section className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold">{titre}</h2>
          <p className="mt-0.5 text-xs text-gray-500">{description}</p>
        </div>

        <div className="px-4 py-4">
          {chemin ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-gray-700">
                {chemin.split("/").pop()}
              </span>
              <button
                onClick={() => telecharger(chemin)}
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
                    if (f) upload(f, type);
                  }}
                />
              </label>
              <button
                onClick={() => supprimer(chemin, type)}
                className="text-sm text-red-600 hover:underline"
              >
                Retirer
              </button>
            </div>
          ) : (
            <label className="inline-block cursor-pointer rounded bg-black px-4 py-2 text-sm text-white">
              {enCours === type ? "Envoi..." : "Téléverser"}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f, type);
                }}
              />
            </label>
          )}
        </div>
      </section>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Bloc
        titre="CV de référence"
        description="Réutilisable en un clic sur chaque candidature"
        chemin={cvPath}
        type="cv"
      />

      {cvPath && !cvEstPdf && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Votre CV est au format Word. L&apos;analyse de correspondance et la
          préparation d&apos;entretien nécessitent un PDF.
        </p>
      )}

      <Bloc
        titre="Lettre de motivation type"
        description="Base à adapter pour chaque candidature"
        chemin={lmPath}
        type="lm"
      />

      {erreur && <p className="text-sm text-red-600">{erreur}</p>}
    </div>
  );
}
