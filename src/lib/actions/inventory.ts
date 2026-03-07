"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateStock(variantId: string, qty: number): Promise<{ error?: string }> {
  if (qty < 0) return { error: "Quantity cannot be negative" };

  try {
    const supabase = createAdminClient();

    // Upsert — inventory row may not exist yet for a given variant
    const { error } = await supabase
      .from("inventory")
      .upsert({ variant_id: variantId, quantity: qty }, { onConflict: "variant_id" });

    if (error) return { error: error.message };

    // Also sync stock on the variant itself
    await supabase
      .from("product_variants")
      .update({ stock: qty })
      .eq("id", variantId);

    revalidatePath("/[locale]/admin/inventory", "page");
    revalidatePath("/[locale]/admin", "page");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update stock" };
  }
}
