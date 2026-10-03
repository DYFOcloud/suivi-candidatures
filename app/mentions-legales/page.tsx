import Link from "next/link";

export const metadata = {
  title: "Mentions légales — Joply",
  robots: { index: false, follow: false },
};

export default function MentionsLegales() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        Retour
      </Link>

      <h1 className="mt-6 text-3xl font-bold">Mentions légales</h1>
      <p className="mt-2 text-sm text-gray-500">
        Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-700">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Éditeur du site</h2>
          <p className="mt-2">
            Joply est édité par Fatkiné Dufort, personne physique.
            <br />
            Adresse : 12 rue de la Montagne, 92400 Courbevoie, France
            <br />
            Contact : contact@joply.fr
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Hébergement</h2>
          <p className="mt-2">
            Application web : Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA
            91789, États-Unis.
          </p>
          <p className="mt-3">
            Base de données et fichiers : Supabase Inc., 970 Toa Payoh North
            #07-04, Singapour 318992. Données hébergées dans l&apos;Union
            européenne (Francfort, Allemagne).
          </p>
          <p className="mt-3">
            Nom de domaine : OVH SAS, 2 rue Kellermann, 59100 Roubaix, France.
          </p>
        </section>
                <section>
          <h2 className="text-lg font-semibold text-gray-900">
            Propriété intellectuelle
          </h2>
          <p className="mt-2">
            L&apos;ensemble des éléments composant le site Joply est protégé par
            le droit d&apos;auteur et demeure la propriété exclusive de
            l&apos;éditeur. Toute reproduction ou exploitation sans autorisation
            écrite préalable est interdite au sens des articles L335-2 et
            suivants du Code de la propriété intellectuelle.
          </p>
          <p className="mt-3">
            Les documents que vous téléversez et les informations que vous
            saisissez demeurent votre propriété exclusive.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            Données personnelles
          </h2>
          <p className="mt-2">
            Le traitement de vos données est décrit dans notre politique de
            confidentialité.
          </p>
        </section>
                <section>
          <h2 className="text-lg font-semibold text-gray-900">
            Limitation de responsabilité
          </h2>
          <p className="mt-2">
            Joply est un outil d&apos;aide à l&apos;organisation de la recherche
            d&apos;emploi. Les analyses et suggestions générées automatiquement
            sont fournies à titre indicatif et ne constituent ni un conseil
            professionnel, ni une garantie de résultat.
          </p>
          <p className="mt-3">
            Le service est fourni en l&apos;état, sans garantie de disponibilité
            ni d&apos;exactitude.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Droit applicable</h2>
          <p className="mt-2">
            Les présentes mentions légales sont régies par le droit français. En
            cas de litige, et à défaut de résolution amiable, les tribunaux
            français sont seuls compétents.
          </p>
        </section>
      </div>
    </div>
  );
}
