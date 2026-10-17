"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../supabase";
import { SOURCES, CONTRATS } from "../constantes";

type Extraite = {
  entreprise: string;
  poste: string;
  lieu: string | null;
  type_contrat: string | null;
  date_envoi: string | null;
  statut_source: string | null;
};

type Ligne = Extraite & {
  selectionnee: boolean;
  statut: string;
  doublon: boolean;
};

function normaliser(texte: string) {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function deduireStatut(source: string | null): string {
  if (!source) return "Envoyée";
  const s = source.toLowerCase();

  if (
    s.includes("non retenu") ||
    s.includes("refus") ||
    s.includes("rejet") ||
    s.includes("clôtur") ||
    s.includes("cloatur") ||
    s.includes("pourvu")
  ) {
    return "Refus";
  }

  if (s.includes("entretien")) return "Entretien RH";

  return "Envoyée";
}

export default function ImportListe() {
  const [texte, setTexte] = useState("");
  const [source, setSource] = useState("");
  const [lignes, setLignes] = useState<Ligne[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [resultat, setResultat] = useState<number | null>(null);

  const router = useRouter();

  async function analyser() {
    if (texte.length < 50) {
      setErreur("Collez le contenu de votre page « Mes candidatures ».");
      return;
    }

    setLoading(true);
    setErreur("");

    try {
      const reponse = await fetch("/api/importer-liste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texte }),
      });

      const donnees = await reponse.json();

      if (!reponse.ok) {
        setErreur(donnees.erreur ?? "Analyse impossible.");
        setLoading(false);
        return;
      }

      const extraites: Extraite[] = donnees.candidatures;

      if (extraites.length === 0) {
        setErreur("Aucune candidature détectée dans ce texte.");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data: existantes } = await supabase
        .from("candidatures")
        .select("entreprise, poste");

      const connues = new Set(
        (existantes ?? []).map(
          (c) => `${normaliser(c.entreprise)}|${normaliser(c.poste)}`
        )
      );

      const preparees: Ligne[] = extraites.map((e) => {
        const cle = `${normaliser(e.entreprise)}|${normaliser(e.poste)}`;
        const doublon = connues.has(cle);
        return {
          ...e,
          doublon,
          selectionnee: !doublon,
          statut: deduireStatut(e.statut_source),
        };
      });

            preparees.sort((a, b) => {
        if (!a.date_envoi && !b.date_envoi) return 0;
        if (!a.date_envoi) return 1;
        if (!b.date_envoi) return -1;
        return b.date_envoi.localeCompare(a.date_envoi);
      });

      setLignes(preparees);
    } catch {
      setErreur("Erreur de connexion.");
    }

    setLoading(false);
  }

  async function enregistrer() {
    if (!lignes) return;

    const aCreer = lignes.filter((l) => l.selectionnee);
    if (aCreer.length === 0) {
      setErreur("Aucune candidature sélectionnée.");
      return;
    }

    setEnregistrement(true);
    setErreur("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("candidatures").insert(
      aCreer.map((l) => ({
        user_id: user.id,
        entreprise: l.entreprise,
        poste: l.poste,
        lieu: l.lieu || null,
        type_contrat: CONTRATS.includes(l.type_contrat ?? "")
          ? l.type_contrat
          : null,
        source: source || null,
        statut: l.statut,
        date_envoi: l.date_envoi || null,
        archivee: l.statut === "Refus",
      }))
    );

    setEnregistrement(false);

    if (error) {
      setErreur(error.message);
    } else {
      setResultat(aCreer.length);
      router.refresh();
    }
  }

  function basculer(i: number) {
    if (!lignes) return;
    const copie = [...lignes];
    copie[i] = { ...copie[i], selectionnee: !copie[i].selectionnee };
    setLignes(copie);
  }

  function changerStatut(i: number, valeur: string) {
    if (!lignes) return;
    const copie = [...lignes];
    copie[i] = { ...copie[i], statut: valeur };
    setLignes(copie);
  }

  const champ = "w-full rounded border px-3 py-2 text-sm";
    if (resultat !== null) {
    return (
      <div className="max-w-2xl rounded-lg border border-green-200 bg-green-50 p-6">
        <p className="font-medium text-green-900">
          {resultat} candidature{resultat > 1 ? "s" : ""} importée
          {resultat > 1 ? "s" : ""}
        </p>
        <p className="mt-1 text-sm text-green-800">
          Vous pouvez maintenant compléter chaque fiche : salaire, texte de
          l&apos;offre, documents.
        </p>
        <div className="mt-4 flex gap-2">
          <Link
            href="/candidatures"
            className="rounded bg-black px-4 py-2 text-sm text-white"
          >
            Voir mes candidatures
          </Link>
          <button
            onClick={() => {
              setResultat(null);
              setLignes(null);
              setTexte("");
            }}
            className="rounded border bg-white px-4 py-2 text-sm"
          >
            Importer une autre liste
          </button>
        </div>
      </div>
    );
  }

  if (lignes) {
    const nbSelection = lignes.filter((l) => l.selectionnee).length;
    const nbDoublons = lignes.filter((l) => l.doublon).length;

    return (
      <div className="max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-gray-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium">
              {lignes.length} candidature{lignes.length > 1 ? "s" : ""} détectée
              {lignes.length > 1 ? "s" : ""}
            </p>
            {nbDoublons > 0 && (
              <p className="text-xs text-amber-700">
                {nbDoublons} semble{nbDoublons > 1 ? "nt" : ""} déjà exister,
                décochée{nbDoublons > 1 ? "s" : ""} par défaut
              </p>
            )}
          </div>
          <button
            onClick={() => setLignes(null)}
            className="text-sm text-gray-500 hover:underline"
          >
            Recommencer
          </button>
        </div>

        <ul className="mt-4 divide-y rounded-lg border">
          {lignes.map((l, i) => (
            <li
              key={i}
              className={`px-4 py-3 ${l.doublon ? "bg-amber-50/50" : ""}`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={l.selectionnee}
                  onChange={() => basculer(i)}
                  className="mt-1 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{l.entreprise}</p>
                  <p className="text-sm text-gray-600">{l.poste}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                    {l.lieu && <span>{l.lieu}</span>}
                    {l.type_contrat && <span>{l.type_contrat}</span>}
                    {l.date_envoi && (
                      <span>
                        envoyée le{" "}
                        {new Date(l.date_envoi).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                    {l.doublon && (
                      <span className="font-medium text-amber-700">
                        doublon probable
                      </span>
                    )}
                  </div>
                </div>
                <select
                  value={l.statut}
                  onChange={(e) => changerStatut(i, e.target.value)}
                  className="shrink-0 rounded border px-2 py-1 text-xs"
                >
                  <option>Envoyée</option>
                  <option>Entretien RH</option>
                  <option>En process</option>
                  <option>Refus</option>
                </select>
              </div>
            </li>
          ))}
        </ul>

        {erreur && <p className="mt-3 text-sm text-red-600">{erreur}</p>}

        <div className="mt-4 flex gap-2">
          <button
            onClick={enregistrer}
            disabled={enregistrement || nbSelection === 0}
            className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {enregistrement
              ? "Enregistrement..."
              : `Importer ${nbSelection} candidature${nbSelection > 1 ? "s" : ""}`}
          </button>
          <Link href="/candidatures" className="rounded border px-4 py-2 text-sm">
            Annuler
          </Link>
        </div>
      </div>
    );
  }
    return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-lg border bg-gray-50 px-4 py-3">
        <p className="text-sm font-medium">Comment procéder</p>
        <ol className="mt-2 space-y-1 text-sm text-gray-600">
          <li>1. Ouvrez la page « Mes candidatures » de votre site d&apos;emploi</li>
          <li>2. Sélectionnez tout le contenu avec Ctrl+A, puis copiez avec Ctrl+C</li>
          <li>3. Collez ci-dessous</li>
        </ol>
        <p className="mt-2 text-xs text-gray-500">
          Seules les informations visibles sur cette page seront importées :
          entreprise, poste, date et statut. Vous compléterez chaque fiche
          ensuite.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Site d&apos;origine
        </label>
        <select
          className={champ}
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          <option value="">—</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Appliqué à toutes les candidatures importées
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Contenu de la page
        </label>
        <textarea
          className={`${champ} mt-1`}
          rows={12}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="Collez ici le contenu de votre page « Mes candidatures »..."
        />
      </div>

      {erreur && <p className="text-sm text-red-600">{erreur}</p>}

      <div className="flex gap-2">
        <button
          onClick={analyser}
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {loading ? "Analyse en cours..." : "Analyser la liste"}
        </button>
        <Link href="/candidatures" className="rounded border px-4 py-2 text-sm">
          Annuler
        </Link>
      </div>
    </div>
  );
}
