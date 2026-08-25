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
}: {
  id: string;
  cvPath: string | null;
  lmPath: string | null;
}) {
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState("");
  const router = useRouter();

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
    await supabase
      .from("candidatures")
      .update({ [colonne]: chemin })
      .eq("id", id);

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
    await supabase
      .from("candidatures")
      .update({ [colonne]: null })
      .eq("id", id);

    router.refresh();
  }

  function Ligne({
    label,
    chemin,
    type,
  }: {
    label: string;
    chemin: string | null;
    type: "cv" | "lm";
  }) {
    return (
      <div className="flex items-center justify-between px-5 py-3 text-sm">
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
            {enCours === type ? "Envoi..." : "Ajouter"}
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
    );
  }

  return (
    <section className="rounded-lg border">
      <h2 className="border-b px-5 py-3 font-semibold">Documents</h2>
      <div className="divide-y">
        <Ligne label="CV" chemin={cvPath} type="cv" />
        <Ligne label="Lettre de motivation" chemin={lmPath} type="lm" />
      </div>
      {erreur && <p className="px-5 pb-3 text-sm text-red-600">{erreur}</p>}
    </section>
  );
}
