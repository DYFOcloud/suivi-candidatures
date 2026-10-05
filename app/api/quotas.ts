import { SupabaseClient } from "@supabase/supabase-js";

export const LIMITES = {
  extraction: 30,
  correspondance: 15,
  preparation: 10,
} as const;

const COMPTES_ILLIMITES = ["fatkinedufort@gmail.com"];

export type TypeAppel = keyof typeof LIMITES;

const LIBELLES: Record<TypeAppel, string> = {
  extraction: "imports d'offre",
  correspondance: "analyses de correspondance",
  preparation: "préparations d'entretien",
};

function moisCourant() {
  return new Date().toISOString().slice(0, 7);
}

export async function verifierQuota(
  supabase: SupabaseClient,
  userId: string,
  type: TypeAppel,
  email?: string
): Promise<{ autorise: boolean; message?: string; restant: number }> {
  const limite = LIMITES[type];

  if (email && COMPTES_ILLIMITES.includes(email)) {
    return { autorise: true, restant: 9999 };
  }

  const mois = moisCourant();

  const { count, error } = await supabase
    .from("usage_ia")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type_appel", type)
    .eq("mois", mois);

  if (error) return { autorise: true, restant: limite };

  const utilise = count ?? 0;
  const restant = Math.max(0, limite - utilise);

  if (utilise >= limite) {
    return {
      autorise: false,
      restant: 0,
      message: `Limite mensuelle atteinte (${limite} ${LIBELLES[type]}). Le compteur se réinitialise le 1er du mois.`,
    };
  }

  return { autorise: true, restant };
}

export async function enregistrerAppel(
  supabase: SupabaseClient,
  userId: string,
  type: TypeAppel
) {
  const { error } = await supabase.from("usage_ia").insert({
    user_id: userId,
    type_appel: type,
    mois: moisCourant(),
  });

  if (error) {
    console.error("ERREUR usage_ia:", error.message, error.details, error.hint);
  }
}
