import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// POST /api/admin/landing-page/publish — copy draft → published, bump version, revalidate pages
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();

  // Load current draft
  const { data: draft, error: draftError } = await admin
    .from("landing_page_config")
    .select("config")
    .eq("id", "draft")
    .single();

  if (draftError || !draft) {
    return NextResponse.json({ error: draftError?.message ?? "No draft found" }, { status: 500 });
  }

  // Bump version
  const config = draft.config as Record<string, unknown>;
  const newVersion = ((config._version as number) ?? 0) + 1;
  const publishedConfig = { ...config, _version: newVersion };

  // Write published row
  const { error: publishError } = await admin
    .from("landing_page_config")
    .upsert({ id: "published", config: publishedConfig, updated_at: new Date().toISOString() });

  if (publishError) {
    return NextResponse.json({ error: publishError.message }, { status: 500 });
  }

  // Also update draft version to match
  await admin
    .from("landing_page_config")
    .update({ config: publishedConfig })
    .eq("id", "draft");

  // Revalidate live pages immediately
  revalidatePath("/mn");
  revalidatePath("/en");

  return NextResponse.json({ ok: true, version: newVersion });
}
