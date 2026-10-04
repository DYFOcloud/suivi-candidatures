"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../supabase";

const TYPES_OK = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function Documents({
  id,
  cvPath,
  lmPath,
  cvReference,
  lmReference,
}: {
  id: string;
  cvPath: string | null;
  lmPath: string | null;
  cvReference: string | null;
  lmReference: string | null;
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const extension = fichier.name.split(".").pop();
    const chemin = `${user.id}/${id}-${type}.${extension}`;

    const { error: erreurUpload } = await supabase.storage
      .from("documents")
      .upload(chemin, fichier, { upsert: true });

    if (erreurUpload) {
      setErreur(erreurUpload.message);
      setEnCours("");
      return;
    }

    const colonne = type === "cv" ? "cv_path" : "lm_path";
    await supabase.from("candidatures").update({ [colonne]: chemin }).eq("id", id);

    setEnCours("");
    router.refresh();
  }

  async function utiliserReference(cheminRef: string, type: "cv" | "lm") {
    setEnCours(type);
    setErreur("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: fichier, error: erreurDl } = await supabase.storage
      .from("documents")
      .download(cheminRef);

    if (erreurDl || !fichier) {
      setErreur("Document de référence illisible.");
      setEnCours("");
      return;
    }

    const extension = cheminRef.split(".").pop();
    const chemin = `${user.id}/${id}-${type}.${extension}`;

    const { error: erreurUp } = await supabase.storage
      .from("documents")
      .upload(chemin, fichier, { upsert: true });

    if (erreurUp) {
      setErreur(erreurUp.message);
      setEnCours("");
      return;
    }

    const colonne = type === "cv" ? "cv_path" : "lm_path";
    await supabase.from("candidatures").update({ [colonne]: chemin }).eq("id", id);

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

    const colonne = type === "cv" ? "cv_path" : "lm_path";
    await supabase.from("candidatures").update({ [colonne]: null }).eq("id", id);

    router.refresh();
  }
    function Ligne({
    label,
    chemin,
    reference,
    type,
  }: {
    label: string;
    chemin: string | null;
    reference: string | null;
    type: "cv" | "lm";
  }) {
    return (
      <div className="px-4 py-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-gray-500">{label}</span>

          {chemin ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => telecharger(chemin)}
                className="text-blue-600 hover:underline"
              >
                Ouvrir
              </button>
              <button
                onClick={() => supprimer(chemin, type)}
                className="text-red-600 hover:underline"
              >
                Retirer
              </button>
            </div>
          ) : (
            <label className="cursor-pointer text-blue-600 hover:underline">
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

        {!chemin && reference && (
          <button
            onClick={() => utiliserReference(reference, type)}
            disabled={enCours === type}
            className="mt-1 text-xs text-gray-500 hover:underline disabled:opacity-50"
          >
            Utiliser mon {type === "cv" ? "CV" : "modèle"} de référence
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="rounded-lg border">
      <h2 className="border-b px-4 py-3 font-semibold">Documents</h2>
      <div className="divide-y">
        <Ligne label="CV" chemin={cvPath} reference={cvReference} type="cv" />
        <Ligne
          label="Lettre de motivation"
          chemin={lmPath}
          reference={lmReference}
          type="lm"
        />
      </div>

      {cvPath && !cvEstPdf && (
        <p className="border-t bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Votre CV est au format Word. L&apos;analyse de correspondance et la
          préparation d&apos;entretien nécessitent un PDF.
        </p>
      )}

      {erreur && <p className="px-4 pb-3 text-sm text-red-600">{erreur}</p>}
    </section>
  );
}
