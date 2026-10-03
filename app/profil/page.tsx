import { createClient } from "../supabase-server";
import { redirect } from "next/navigation";
import Compte from "./Compte";

export const dynamic = "force-dynamic";

export default async function Profil() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="text-3xl font-bold">Profil</h1>
      <p className="mt-2 text-gray-600">Gérez votre compte et vos données</p>

      <div className="mt-8">
        <Compte email={user.email ?? ""} />
      </div>
    </div>
  );
}
