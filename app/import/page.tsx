import { createClient } from "../supabase-server";
import { redirect } from "next/navigation";
import ImportListe from "./ImportListe";

export const dynamic = "force-dynamic";

export default async function Import() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold md:text-3xl">Importer une liste</h1>
      <p className="mt-1 text-sm text-gray-600">
        Rapatriez vos candidatures depuis un site d&apos;emploi
      </p>

      <div className="mt-6">
        <ImportListe />
      </div>
    </div>
  );
}
