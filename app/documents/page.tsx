import { createClient } from "../supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Documents from "./Documents";

export const dynamic = "force-dynamic";

export default async function MesDocuments() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profil } = await supabase
    .from("profils")
    .select("cv_reference_path")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div>
      <h1 className="text-2xl font-bold md:text-3xl">Mes documents</h1>
      <p className="mt-1 text-sm text-gray-600">
        Votre CV de référence et vos exports
      </p>

      <div className="mt-6 max-w-2xl space-y-4">
        <Documents userId={user.id} cvPath={profil?.cv_reference_path ?? null} />

        <section className="rounded-lg border">
          <h2 className="border-b px-4 py-3 font-semibold">
            Rapport de candidatures
          </h2>
          <div className="px-4 py-4">
            <p className="text-sm text-gray-600">
              Récapitulatif de vos candidatures et entretiens, prêt à imprimer
              ou à enregistrer en PDF.
            </p>
            <Link
              href="/rapport"
              className="mt-3 inline-block rounded bg-black px-4 py-2 text-sm text-white"
            >
              Générer mon rapport
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
