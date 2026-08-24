export type Candidature = {
  id: number;
  entreprise: string;
  poste: string;
  lieu: string;
  statut: string;
  dateEnvoi: string | null;
  salaireMin: number | null;
  salaireMax: number | null;
  urlOffre: string | null;
  cvNom: string | null;
  lmNom: string | null;
};

export const candidatures: Candidature[] = [
  {
    id: 1,
    entreprise: "Société Générale",
    poste: "Analyste crédit",
    lieu: "Paris",
    statut: "Entretien RH",
    dateEnvoi: "2026-08-12",
    salaireMin: 45000,
    salaireMax: 55000,
    urlOffre: "https://exemple.fr/offre-1",
    cvNom: "CV_Romain_finance.pdf",
    lmNom: "LM_SocGen.pdf",
  },
  {
    id: 2,
    entreprise: "Deloitte",
    poste: "Consultant restructuring",
    lieu: "Paris La Défense",
    statut: "Envoyée",
    dateEnvoi: "2026-08-18",
    salaireMin: 50000,
    salaireMax: null,
    urlOffre: null,
    cvNom: "CV_Romain_conseil.pdf",
    lmNom: null,
  },
  {
    id: 3,
    entreprise: "BNP Paribas",
    poste: "Chargé d'affaires",
    lieu: "Lyon",
    statut: "À envoyer",
    dateEnvoi: null,
    salaireMin: null,
    salaireMax: null,
    urlOffre: "https://exemple.fr/offre-3",
    cvNom: null,
    lmNom: null,
  },
    {
    id: 4,
    entreprise: "Rothschild & Co",
    poste: "Analyste M&A",
    lieu: "Paris",
    statut: "Refus",
    dateEnvoi: "2026-07-30",
    salaireMin: null,
    salaireMax: null,
    urlOffre: null,
    cvNom: null,
    lmNom: null,
  },
];