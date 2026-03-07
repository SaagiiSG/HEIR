"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface SiteSettings {
  announcement_mn: string;
  announcement_en: string;
  shipping_fee: number;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("site_settings")
      .select("announcement_mn, announcement_en, shipping_fee")
      .eq("id", "default")
      .single();

    if (data) return data as SiteSettings;
  } catch {
    // Fall through to defaults
  }

  return {
    announcement_mn: "",
    announcement_en: "",
    shipping_fee: 0,
  };
}

export async function saveSiteSettings(
  settings: SiteSettings
): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("site_settings")
      .update({
        announcement_mn: settings.announcement_mn,
        announcement_en: settings.announcement_en,
        shipping_fee: settings.shipping_fee,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "default");

    if (error) return { error: error.message };

    revalidatePath("/mn", "layout");
    revalidatePath("/en", "layout");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to save settings" };
  }
}
