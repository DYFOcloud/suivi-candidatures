import Link from "next/link";

export const metadata = {
  title: "Politique de confidentialité — Joply",
  robots: { index: false, follow: false },
};

export default function Confidentialite() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        Retour
      </Link>

      <h1 className="mt-6 text-3xl font-bold">Politique de confidentialité</h1>
      <p className="mt-2 text-sm text-gray-500">
        Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-700">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            Responsable de traitement
          </h2>
          <p className="mt-2">
            Fatkiné Dufort, 12 rue de la Montagne, 92400 Courbevoie, France.
            <br />
            Contact : contact@joply.fr
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            Données collectées
          </h2>
          <p className="mt-2">
            <strong>Données de compte</strong> : adresse email, mot de passe
            (stocké sous forme chiffrée, jamais en clair).
          </p>
          <p className="mt-3">
            <strong>Données de candidature</strong> : entreprise, poste, lieu,
            type de contrat, source de l&apos;offre, dates, référence,
            rémunération, texte de l&apos;annonce, notes personnelles.
          </p>
          <p className="mt-3">
            <strong>Documents</strong> : CV et lettres de motivation que vous
            téléversez.
          </p>
          <p className="mt-3">
            <strong>Données d&apos;entretien</strong> : étape, date, nom et
            coordonnées de vos interlocuteurs, questions posées, notes et
            ressenti.
          </p>
        </section>
                <section>
          <h2 className="text-lg font-semibold text-gray-900">
            Finalités et base légale
          </h2>
          <p className="mt-2">
            Vos données sont traitées pour vous permettre de suivre vos
            candidatures, conserver vos documents, organiser vos entretiens et
            bénéficier des analyses automatisées proposées par le service.
          </p>
          <p className="mt-3">
            La base légale de ces traitements est l&apos;exécution du contrat qui
            nous lie (article 6.1.b du RGPD) : ces traitements sont nécessaires à
            la fourniture du service auquel vous avez souscrit.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            Traitement par intelligence artificielle
          </h2>
          <p className="mt-2">
            Trois fonctionnalités du service reposent sur une intelligence
            artificielle : l&apos;extraction automatique des informations
            d&apos;une offre, l&apos;analyse de correspondance entre votre CV et
            une offre, et la préparation d&apos;entretien.
          </p>
          <p className="mt-3">
            Lorsque vous utilisez ces fonctionnalités, le texte de
            l&apos;offre et, le cas échéant, votre CV sont transmis à Anthropic
            PBC (États-Unis), prestataire technique. Ces données ne sont pas
            utilisées pour entraîner les modèles d&apos;Anthropic. Le transfert
            est encadré par les clauses contractuelles types de la Commission
            européenne.
          </p>
          <p className="mt-3">
            Ces fonctionnalités sont facultatives : vous pouvez utiliser Joply
            sans jamais y recourir. Les résultats produits sont indicatifs et ne
            constituent pas un conseil professionnel.
          </p>
        </section>
                <section>
          <h2 className="text-lg font-semibold text-gray-900">Destinataires</h2>
          <p className="mt-2">
            Vos données ne sont ni vendues, ni cédées, ni communiquées à des
            tiers à des fins commerciales. Elles sont accessibles uniquement à
            vous-même et, pour les besoins techniques du service, aux
            sous-traitants suivants :
          </p>
          <ul className="mt-3 space-y-2">
            <li>
              <strong>Supabase Inc.</strong> — hébergement de la base de données
              et des fichiers, dans l&apos;Union européenne (Francfort).
            </li>
            <li>
              <strong>Vercel Inc.</strong> — hébergement de l&apos;application
              web (États-Unis).
            </li>
            <li>
              <strong>Anthropic PBC</strong> — traitement des fonctionnalités
              d&apos;intelligence artificielle (États-Unis).
            </li>
          </ul>
          <p className="mt-3">
            Les transferts hors Union européenne sont encadrés par les clauses
            contractuelles types adoptées par la Commission européenne.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            Durée de conservation
          </h2>
          <p className="mt-2">
            Vos données sont conservées tant que votre compte est actif. Un
            compte sans connexion pendant 24 mois consécutifs est supprimé,
            après envoi d&apos;un avertissement par email.
          </p>
          <p className="mt-3">
            En cas de suppression de votre compte, l&apos;ensemble de vos données
            et documents est effacé immédiatement et définitivement.
          </p>
        </section>
                <section>
          <h2 className="text-lg font-semibold text-gray-900">Vos droits</h2>
          <p className="mt-2">
            Conformément au Règlement général sur la protection des données,
            vous disposez des droits suivants :
          </p>
          <ul className="mt-3 space-y-2">
            <li>
              <strong>Accès</strong> — obtenir une copie de vos données.
              Directement exerçable depuis la page Profil.
            </li>
            <li>
              <strong>Rectification</strong> — corriger vos données.
              Directement exerçable depuis l&apos;application.
            </li>
            <li>
              <strong>Effacement</strong> — supprimer votre compte et
              l&apos;ensemble de vos données. Directement exerçable depuis la
              page Profil.
            </li>
            <li>
              <strong>Portabilité</strong> — récupérer vos données dans un
              format structuré et lisible par machine. Directement exerçable
              depuis la page Profil.
            </li>
            <li>
              <strong>Limitation et opposition</strong> — par demande à
              contact@joply.fr.
            </li>
          </ul>
          <p className="mt-3">
            Toute demande adressée à contact@joply.fr fait l&apos;objet d&apos;une
            réponse dans un délai maximal d&apos;un mois.
          </p>
          <p className="mt-3">
            Si vous estimez que vos droits ne sont pas respectés, vous pouvez
            introduire une réclamation auprès de la Commission nationale de
            l&apos;informatique et des libertés (CNIL), 3 place de Fontenoy,
            75007 Paris — cnil.fr.
          </p>
        </section>
                <section>
          <h2 className="text-lg font-semibold text-gray-900">
            Données concernant des tiers
          </h2>
          <p className="mt-2">
            Le service vous permet d&apos;enregistrer les coordonnées de vos
            interlocuteurs en entretien. Ces données concernent des personnes
            tierces : vous êtes responsable de leur exactitude et de leur
            caractère proportionné. Elles ne sont accessibles qu&apos;à vous
            seul, ne sont jamais transmises à des fins commerciales, et sont
            supprimées avec votre compte.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
          <p className="mt-2">
            Les communications sont chiffrées (HTTPS). Les mots de passe sont
            stockés sous forme de condensats cryptographiques. Un cloisonnement
            au niveau de la base de données garantit qu&apos;aucun utilisateur ne
            peut accéder aux données d&apos;un autre. Vos documents sont stockés
            dans un espace privé, accessible uniquement via des liens temporaires
            générés à votre demande.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Cookies</h2>
          <p className="mt-2">
            Joply n&apos;utilise aucun cookie publicitaire ni traceur
            analytique. Seuls des cookies strictement nécessaires au
            fonctionnement du service sont déposés, afin de maintenir votre
            session ouverte. Ils ne requièrent pas de consentement préalable.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            Modification de la présente politique
          </h2>
          <p className="mt-2">
            Cette politique peut être amenée à évoluer. Toute modification
            substantielle vous sera notifiée par email.
          </p>
        </section>
      </div>
    </div>
  );
}
