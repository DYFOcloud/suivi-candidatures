"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../supabase";

export default function OngletApplication({
  userId,
  relancesInitial,
  entretiensInitial,
  aEnvoyerInitial,
}: {
  userId: string;
  relancesInitial: boolean;
  entretiensInitial: boolean;
  aEnvoyerInitial: boolean;
}) {
  const [relances, setRelances] = useState(relancesInitial);
  const [entretiens, setEntretiens] = useState(entretiensInitial);
  const [aEnvoyer, setAEnvoyer] = useState(aEnvoyerInitial);
  const [message, setMessage] = useState("");
  const [exportEnCours, setExportEnCours] = useState(false);

  async function enregistrer(champ: string, valeur: boolean) {
    const supabase = createClient();
    await supabase.from("profils").upsert({
      id: userId,
      [champ]: valeur,
      updated_at: new Date().toISOString(),
    });
    setMessage("Préférence enregistrée.");
    setTimeout(() => setMessage(""), 2000);
  }

  async function exporterDonnees() {
    setExportEnCours(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: candidatures } = await supabase.from("candidatures").select("*");
    const { data: entretiensData } = await supabase.from("entretiens").select("*");
    const { data: historique } = await supabase.from("historique_statuts").select("*");

    const donnees = {
      export_du: new Date().toISOString(),
      compte: { email: user.email, cree_le: user.created_at },
      candidatures: candidatures ?? [],
      entretiens: entretiensData ?? [],
      historique_statuts: historique ?? [],
    };

    const blob = new Blob([JSON.stringify(donnees, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = `joply-donnees-${new Date().toISOString().slice(0, 10)}.json`;
    lien.click();
    URL.revokeObjectURL(url);

    setExportEnCours(false);
  }

  const liens = [
    { href: "/mentions-legales", label: "Mentions légales" },
    { href: "/confidentialite", label: "Politique de confidentialité" },
    { href: "/conditions", label: "Conditions générales d'utilisation" },
  ];
    return (
    <div className="max-w-2xl space-y-4">
      <section className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold">Notifications par email</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Fonctionnalité en cours de développement
          </p>
        </div>

        <div className="divide-y">
          <label className="flex cursor-pointer items-start justify-between gap-4 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Candidatures à envoyer</p>
              <p className="text-xs text-gray-500">
                Recevoir chaque semaine un récapitulatif des candidatures
                préparées mais pas encore envoyées
              </p>
            </div>
            <input
              type="checkbox"
              checked={aEnvoyer}
              onChange={(e) => {
                setAEnvoyer(e.target.checked);
                enregistrer("notif_a_envoyer", e.target.checked);
              }}
              className="mt-1 shrink-0"
            />
          </label>

          <label className="flex cursor-pointer items-start justify-between gap-4 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Rappels de relance</p>
              <p className="text-xs text-gray-500">
                Recevoir un email lorsqu&apos;une candidature est sans réponse
                depuis trois semaines
              </p>
            </div>
            <input
              type="checkbox"
              checked={relances}
              onChange={(e) => {
                setRelances(e.target.checked);
                enregistrer("notif_relances", e.target.checked);
              }}
              className="mt-1 shrink-0"
            />
          </label>

          <label className="flex cursor-pointer items-start justify-between gap-4 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Rappels d&apos;entretien</p>
              <p className="text-xs text-gray-500">
                Recevoir un email la veille d&apos;un entretien programmé
              </p>
            </div>
            <input
              type="checkbox"
              checked={entretiens}
              onChange={(e) => {
                setEntretiens(e.target.checked);
                enregistrer("notif_entretiens", e.target.checked);
              }}
              className="mt-1 shrink-0"
            />
          </label>
        </div>

        {message && (
          <p className="border-t px-4 py-2 text-xs text-gray-500">{message}</p>
        )}
      </section>

      <section className="rounded-lg border">
        <h2 className="border-b px-4 py-3 font-semibold">Informations légales</h2>
        <ul className="divide-y">
          {liens.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50"
              >
                <span>{l.label}</span>
                <span className="text-gray-400">›</span>
              </Link>
            </li>
          ))}
          <li className="px-4 py-3">
            <button
              onClick={exporterDonnees}
              disabled={exportEnCours}
              className="text-left text-sm text-gray-600 hover:underline disabled:opacity-50"
            >
              {exportEnCours ? "Export en cours..." : "Télécharger mes données"}
            </button>
            <p className="mt-0.5 text-xs text-gray-400">
              Export brut au format JSON, conformément au droit à la portabilité
            </p>
          </li>
        </ul>
      </section>

      <section className="rounded-lg border">
        <h2 className="border-b px-4 py-3 font-semibold">À propos</h2>
        <div className="px-4 py-4 text-sm text-gray-600">
          <p>Joply</p>
          <p className="mt-1 text-xs text-gray-400">Version 1.0</p>
        </div>
      </section>
    </div>
  );
}
