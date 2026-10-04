import Link from "next/link";

export const metadata = {
  title: "Conditions générales d'utilisation — Joply",
  robots: { index: false, follow: false },
};

export default function Conditions() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/profil" className="text-sm text-gray-500 hover:underline">
        Retour
      </Link>

      <h1 className="mt-6 text-3xl font-bold">
        Conditions générales d&apos;utilisation
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-700">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">1. Objet</h2>
          <p className="mt-2">
            Les présentes conditions régissent l&apos;utilisation du service
            Joply, édité par Fatkiné Dufort, accessible en ligne et permettant
            le suivi de candidatures, la gestion de documents et la préparation
            d&apos;entretiens d&apos;embauche.
          </p>
          <p className="mt-3">
            La création d&apos;un compte vaut acceptation sans réserve des
            présentes conditions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">2. Accès au service</h2>
          <p className="mt-2">
            Le service est réservé aux personnes physiques majeures disposant de
            la capacité juridique de contracter. La création d&apos;un compte
            nécessite une adresse email valide.
          </p>
          <p className="mt-3">
            Vous êtes responsable de la confidentialité de vos identifiants et
            de toute activité réalisée depuis votre compte.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">3. Utilisation</h2>
          <p className="mt-2">Vous vous engagez à ne pas :</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>utiliser le service à des fins illicites</li>
            <li>tenter d&apos;accéder aux données d&apos;autres utilisateurs</li>
            <li>perturber le fonctionnement du service ou contourner ses limitations techniques</li>
            <li>extraire ou réutiliser de manière automatisée le contenu du service</li>
            <li>téléverser des contenus contraires à la loi ou aux droits de tiers</li>
          </ul>
          <p className="mt-3">
            Tout manquement peut entraîner la suspension ou la suppression du
            compte sans préavis.
          </p>
        </section>
                <section>
          <h2 className="text-lg font-semibold text-gray-900">
            4. Fonctionnalités d&apos;intelligence artificielle
          </h2>
          <p className="mt-2">
            Le service propose des analyses automatisées : extraction
            d&apos;informations d&apos;une offre, évaluation de correspondance
            entre un CV et une offre, génération de questions d&apos;entretien.
          </p>
          <p className="mt-3">
            Ces résultats sont fournis à titre indicatif. Ils ne constituent ni
            un conseil professionnel, ni une évaluation objective de vos
            chances, ni une garantie de résultat. Les scores produits ne
            reproduisent aucun système de tri utilisé par les recruteurs.
          </p>
          <p className="mt-3">
            Ces fonctionnalités sont soumises à des limites d&apos;utilisation
            mensuelles, indiquées dans l&apos;application et susceptibles
            d&apos;évoluer.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            5. Vos contenus
          </h2>
          <p className="mt-2">
            Vous conservez l&apos;intégralité des droits sur les documents et
            informations que vous déposez. L&apos;éditeur ne revendique aucun
            droit de propriété sur ces contenus et ne les exploite à aucune fin
            autre que la fourniture du service.
          </p>
          <p className="mt-3">
            Vous garantissez disposer des droits nécessaires sur les contenus
            déposés, notamment lorsqu&apos;ils comportent des données
            concernant des tiers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            6. Disponibilité et responsabilité
          </h2>
          <p className="mt-2">
            Le service est fourni en l&apos;état, sans garantie de
            disponibilité continue. L&apos;éditeur peut suspendre
            temporairement l&apos;accès pour maintenance.
          </p>
          <p className="mt-3">
            L&apos;éditeur ne saurait être tenu responsable des décisions prises
            sur le fondement des informations ou analyses fournies, ni des
            conséquences d&apos;une candidature.
          </p>
          <p className="mt-3">
            Il vous appartient de conserver une copie de vos documents
            importants. Une fonction d&apos;export est mise à votre disposition
            depuis votre profil.
          </p>
        </section>
                <section>
          <h2 className="text-lg font-semibold text-gray-900">
            7. Tarifs et abonnement
          </h2>
          <p className="mt-2">
            Le service est actuellement gratuit. Des fonctionnalités payantes
            pourront être proposées ultérieurement. Dans ce cas, les tarifs et
            modalités seront portés à votre connaissance avant toute
            souscription.
          </p>
          <p className="mt-3">
            Conformément à l&apos;article L221-18 du Code de la consommation,
            vous disposerez d&apos;un droit de rétractation de quatorze jours à
            compter de la souscription, sauf renoncement exprès en cas
            d&apos;exécution immédiate du service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            8. Résiliation
          </h2>
          <p className="mt-2">
            Vous pouvez supprimer votre compte à tout moment depuis votre
            profil. La suppression entraîne l&apos;effacement définitif de
            l&apos;ensemble de vos données et documents.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            9. Données personnelles
          </h2>
          <p className="mt-2">
            Le traitement de vos données est décrit dans notre{" "}
            <Link href="/confidentialite" className="text-blue-600 hover:underline">
              politique de confidentialité
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            10. Modification des conditions
          </h2>
          <p className="mt-2">
            Les présentes conditions peuvent évoluer. Toute modification
            substantielle vous sera notifiée par email. La poursuite de
            l&apos;utilisation du service vaut acceptation des nouvelles
            conditions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            11. Droit applicable
          </h2>
          <p className="mt-2">
            Les présentes conditions sont régies par le droit français. En cas
            de litige, une solution amiable sera recherchée en priorité. À
            défaut, les tribunaux français sont compétents.
          </p>
          <p className="mt-3">
            Conformément à l&apos;article L612-1 du Code de la consommation,
            vous pouvez recourir gratuitement à un médiateur de la
            consommation. Toute réclamation préalable peut être adressée à
            contact@joply.fr.
          </p>
        </section>
      </div>
    </div>
  );
}
