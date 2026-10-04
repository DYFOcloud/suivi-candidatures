import { createClient } from "../supabase-server";
import { redirect } from "next/navigation";
import Documents from "./Documents";

export const dynamic = "force-dynamic";

export default async function MesDocuments() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profil } = await supabase
    .from("profils")
    .select("cv_reference_path, lm_reference_path")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div>
      <h1 className="text-2xl font-bold md:text-3xl">Mes documents</h1>
      <p className="mt-1 text-sm text-gray-600">
        Vos documents de référence, réutilisables sur chaque candidature
      </p>

      <div className="mt-6">
        <Documents
          userId={user.id}
          cvPath={profil?.cv_reference_path ?? null}
          lmPath={profil?.lm_reference_path ?? null}
        />
      </div>
    </div>
  );
}
