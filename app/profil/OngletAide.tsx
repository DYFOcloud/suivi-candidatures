const FAQ = [
  {
    question: "Comment ajouter une candidature rapidement ?",
    reponse:
      "Depuis « + Nouvelle », cliquez sur « Coller une offre pour remplir automatiquement ». Copiez le texte de l'annonce (Ctrl+A puis Ctrl+C sur la page de l'offre) et collez-le. Les champs se remplissent seuls.",
  },
  {
    question: "Pourquoi mon CV doit-il être en PDF ?",
    reponse:
      "L'analyse de correspondance et la préparation d'entretien lisent directement le PDF. Un fichier Word ne peut pas être traité. Enregistrez votre CV en PDF depuis Word, puis remplacez-le sur la fiche.",
  },
  {
    question: "Le score de correspondance est-il fiable ?",
    reponse:
      "Il indique l'adéquation entre votre CV et le vocabulaire de l'offre. Ce n'est pas le score utilisé par les recruteurs, qui dépend de leurs propres outils. Prenez-le comme un repère pour savoir quoi adapter.",
  },
  {
    question: "Comment planifier un entretien ?",
    reponse:
      "Depuis l'Agenda, cliquez sur le jour concerné, puis sur « Ajouter un entretien ce jour ». Sélectionnez la candidature, l'étape et l'heure. L'entretien apparaîtra aussi sur la fiche de la candidature.",
  },
  {
    question: "Que deviennent mes candidatures refusées ?",
    reponse:
      "Elles sont archivées automatiquement et n'encombrent plus votre liste. Vous les retrouvez via le lien en bas de la page Candidatures. Changer leur statut les réactive.",
  },
  {
    question: "Mes données sont-elles privées ?",
    reponse:
      "Oui. Vos candidatures et documents ne sont accessibles qu'à vous. Les fichiers sont stockés dans un espace privé et ne sont jamais partagés. Vous pouvez exporter ou supprimer l'ensemble de vos données à tout moment depuis l'onglet Compte.",
  },
];

export default function OngletAide() {
  return (
    <div className="max-w-2xl space-y-4">
      <section className="rounded-lg border">
        <h2 className="border-b px-4 py-3 font-semibold">Nous contacter</h2>
        <div className="px-4 py-4">
          <p className="text-sm text-gray-600">
            Une question, un problème technique, une suggestion ? Écrivez-nous.
          </p>
          <a
            href="mailto:contact@joply.fr"
            className="mt-3 inline-block rounded bg-black px-4 py-2 text-sm text-white"
          >
            contact@joply.fr
          </a>
          <p className="mt-3 text-xs text-gray-500">
            Nous répondons sous quelques jours ouvrés.
          </p>
        </div>
      </section>

      <section className="rounded-lg border">
        <h2 className="border-b px-4 py-3 font-semibold">Questions fréquentes</h2>
        <ul className="divide-y">
          {FAQ.map((f) => (
            <li key={f.question} className="px-4 py-3">
              <p className="text-sm font-medium">{f.question}</p>
              <p className="mt-1 text-sm text-gray-600">{f.reponse}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
