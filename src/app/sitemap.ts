import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://heir.mn";
const LOCALES = ["mn", "en"];

function url(path: string, lastModified?: Date) {
  return LOCALES.map((locale) => ({
    url: `${BASE_URL}/${locale}${path}`,
    lastModified: lastModified ?? new Date(),
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `${BASE_URL}/${l}${path}`])
      ),
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes = [
    "",
    "/store",
    "/drops",
    "/about",
    "/care-guide",
    "/login",
    "/register",
  ].flatMap((path) => url(path));

  // Dynamic product routes
  let productRoutes: MetadataRoute.Sitemap = [];
  let dropRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = createAdminClient();

    const { data: products } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true);
    productRoutes = (products ?? []).flatMap((p) =>
      url(`/store/${p.slug}`, p.updated_at ? new Date(p.updated_at) : undefined)
    );

    const { data: drops } = await supabase
      .from("drops")
      .select("slug")
      .eq("is_active", true);
    dropRoutes = (drops ?? []).flatMap((d) => url(`/drops/${d.slug}`));
  } catch {
    // silently skip dynamic routes on build if DB unavailable
  }

  return [
    ...staticRoutes,
    ...productRoutes,
    ...dropRoutes,
  ];
}
