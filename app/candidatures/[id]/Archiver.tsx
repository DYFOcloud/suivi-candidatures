"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../supabase";

export default function Archiver({
  id,
  archivee,
}: {
  id: string;
  archivee: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function basculer() {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("candidatures")
      .update({ archivee: !archivee })
      .eq("id", id);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={basculer}
      disabled={loading}
      className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
    >
      {loading ? "..." : archivee ? "Désarchiver" : "Archiver"}
    </button>
  );
}
