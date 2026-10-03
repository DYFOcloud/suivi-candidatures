import { NextResponse } from "next/server";
import { createClient } from "../../supabase-server";
import { createClient as createAdmin } from "@supabase/supabase-js";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: fichiers } = await admin.storage
    .from("documents")
    .list(user.id);

  if (fichiers && fichiers.length > 0) {
    const chemins = fichiers.map((f) => `${user.id}/${f.name}`);
    await admin.storage.from("documents").remove(chemins);
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json({ erreur: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
