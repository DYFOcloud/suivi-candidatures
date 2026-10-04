import { createClient } from "../supabase-server";
import { redirect } from "next/navigation";
import Onglets from "./Onglets";
import OngletCompte from "./OngletCompte";
import OngletApplication from "./OngletApplication";
import OngletAide from "./OngletAide";

export const dynamic = "force-dynamic";

export default async function Profil() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profil } = await supabase
    .from("profils")
    .select("notif_relances, notif_entretiens, notif_a_envoyer")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div>
      <h1 className="text-2xl font-bold md:text-3xl">Profil</h1>
      <p className="mt-1 text-sm text-gray-600">{user.email}</p>

      <div className="mt-6">
        <Onglets
          compte={<OngletCompte email={user.email ?? ""} />}
          application={
            <OngletApplication
              userId={user.id}
              relancesInitial={profil?.notif_relances ?? true}
              entretiensInitial={profil?.notif_entretiens ?? true}
              aEnvoyerInitial={profil?.notif_a_envoyer ?? true}
            />
          }
          aide={<OngletAide />}
        />
      </div>
    </div>
  );
}
