export const STATUTS = [
  "À envoyer",
  "Envoyée",
  "Contacté par un recruteur",
  "Entretien RH",
  "Proposition",
  "Offre acceptée",
  "Refus",
];

export const CONTRATS = [
  "CDI",
  "CDD",
  "Stage",
  "Alternance",
  "Intérim",
  "Freelance",
];

export const CONTRATS_AVEC_DUREE = ["CDD", "Stage", "Alternance", "Intérim"];

export const SOURCES = [
  "LinkedIn",
  "Indeed",
  "HelloWork",
  "Welcome to the Jungle",
  "APEC",
  "France Travail",
  "Meteojob",
  "Cadremploi",
  "Monster",
  "Le Figaro Emploi",
  "Business France",
  "JobTeaser",
  "L'Étudiant Jobs",
  "1jeune1solution",
  "La Bonne Alternance",
  "eFinancialCareers",
  "Hosco",
  "FashionJobs",
  "Staffsanté",
  "Site carrière",
  "Cabinet de recrutement",
  "Cooptation",
  "Candidature spontanée",
  "Autre",
];

export const PERIODICITES = [
  { valeur: "annuel", label: "par an" },
  { valeur: "mensuel", label: "par mois" },
];

export const COULEURS_STATUT: Record<string, string> = {
  "À envoyer": "bg-orange-100 text-orange-700",
  "Envoyée": "bg-blue-100 text-blue-700",
  "Contacté par un recruteur": "bg-sky-100 text-sky-700",
  "Entretien RH": "bg-violet-100 text-violet-700",
  "Proposition": "bg-green-100 text-green-700",
  "Offre acceptée": "bg-emerald-600 text-white",
  "Refus": "bg-red-100 text-red-700",
};

export const STATUTS_REPONSE = [
  "Entretien RH",
  "Proposition",
  "Offre acceptée",
  "Refus",
];

export const STATUTS_POSITIFS = [
  "Entretien RH",
  "Proposition",
  "Offre acceptée",
];

export function formatSalaire(
  min: number | null,
  max: number | null,
  periodicite?: string | null
) {
  if (!min && !max) return "—";
  const suffixe = periodicite === "mensuel" ? " / mois" : " / an";

  if (periodicite === "mensuel") {
    if (min && max) return `${min}–${max} €${suffixe}`;
    return `${min ?? max} €${suffixe}`;
  }

  if (min && max) return `${min / 1000}–${max / 1000} k€${suffixe}`;
  return `${(min ?? max)! / 1000} k€${suffixe}`;
}
