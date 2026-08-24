"use client";

import { useRouter } from "next/navigation";
import { createClient } from "./supabase";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
    >
      Déconnexion
    </button>
  );
}
