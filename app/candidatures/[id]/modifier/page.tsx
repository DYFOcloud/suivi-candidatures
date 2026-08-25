import { createClient } from "../../../supabase-server";
import { redirect, notFound } from "next/navigation";
import Formulaire from "./Formulaire";

export default async function Modifier({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: c } = await supabase
    .from("candidatures")
    .select("*")
    .eq("id", id)
    .single();

  if (!c) notFound();

  return <Formulaire candidature={c} />;
}
