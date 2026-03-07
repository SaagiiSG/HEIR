import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// GET /api/admin/landing-page/products?q=&limit=20
// Returns products for the product picker in the landing page editor
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

  const admin = createAdminClient();

  let query = admin
    .from("products")
    .select("id, slug, name_en, name_mn, base_price, compare_at_price, product_images(url, is_primary), product_variants(color_hex)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (q) {
    query = query.or(`name_en.ilike.%${q}%,name_mn.ilike.%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Normalize for the picker
  type RawProduct = {
    id: string;
    slug: string;
    name_en: string;
    name_mn: string;
    base_price: number;
    compare_at_price: number | null;
    product_images: Array<{ url: string; is_primary: boolean }> | null;
    product_variants: Array<{ color_hex: string | null }> | null;
  };

  const products = (data ?? []).map((p: RawProduct) => {
    const images = p.product_images ?? [];
    const primaryImage = images.find((i) => i.is_primary) ?? images[0];
    const rawUrl = primaryImage?.url ?? "";
    // Discard blob: URLs (upload fallback that doesn't persist across sessions)
    const primaryImageUrl = rawUrl.startsWith("https://")
      ? rawUrl
      : "https://placehold.co/400x400/f5f5f5/f5f5f5";
    const swatches = [...new Set(
      (p.product_variants ?? [])
        .map((v) => v.color_hex)
        .filter(Boolean) as string[]
    )];

    return {
      id: p.id,
      slug: p.slug,
      name_en: p.name_en,
      name_mn: p.name_mn,
      base_price: p.base_price,
      compare_at_price: p.compare_at_price ?? null,
      primaryImageUrl,
      colorSwatches: swatches,
    };
  });

  return NextResponse.json({ products });
}
