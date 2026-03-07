import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// GET /api/admin/landing-page/reviews?q=&limit=30
// Returns reviews (approved + unapproved) for admin curation
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
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "30"), 100);

  const admin = createAdminClient();

  type RawReview = {
    id: string;
    rating: number;
    title: string | null;
    body: string;
    is_approved: boolean;
    created_at: string;
    profiles: { first_name: string | null; last_name: string | null } | null;
    products: { name_en: string; name_mn: string; slug: string } | null;
  };

  let query = admin
    .from("reviews")
    .select("id, rating, title, body, is_approved, created_at, profiles(first_name, last_name), products(name_en, name_mn, slug)")
    .order("created_at", { ascending: false })
    .limit(limit);

  // Filter by search term if provided (search in body text)
  // Supabase doesn't support cross-join text search easily, so we filter client-side for small result sets

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const reviews = ((data ?? []) as unknown as RawReview[])
    .filter((r) => {
      if (!q) return true;
      const ql = q.toLowerCase();
      const name = `${r.profiles?.first_name ?? ""} ${r.profiles?.last_name ?? ""}`.toLowerCase();
      const body = (r.body ?? "").toLowerCase();
      const product = `${r.products?.name_en ?? ""} ${r.products?.name_mn ?? ""}`.toLowerCase();
      return name.includes(ql) || body.includes(ql) || product.includes(ql);
    })
    .map((r) => ({
      reviewId: r.id,
      rating: r.rating,
      title: r.title,
      content: r.body,
      isApproved: r.is_approved,
      reviewerName: r.profiles
        ? `${r.profiles.first_name ?? ""} ${r.profiles.last_name ?? ""}`.trim() || "Customer"
        : "Customer",
      productName_en: r.products?.name_en ?? "",
      productName_mn: r.products?.name_mn ?? "",
    }));

  return NextResponse.json({ reviews });
}
