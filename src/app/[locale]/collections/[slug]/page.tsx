import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { LandingPageConfig } from "@/lib/landing-page-types";
import { DEFAULT_CONFIG } from "@/lib/landing-page-types";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { ProductCardData } from "@/components/product/ProductCard";

export const revalidate = 60;

interface CollectionPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

async function getConfig(): Promise<LandingPageConfig> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("landing_page_config")
      .select("config")
      .eq("id", "published")
      .single();
    if (data?.config) return { ...DEFAULT_CONFIG, ...(data.config as LandingPageConfig) };
  } catch {
    // silent fallback
  }
  return DEFAULT_CONFIG;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const config = await getConfig();
  const collection = config.collections.find((c) => c.slug === slug);
  if (!collection) return {};

  const name = locale === "mn" ? collection.label_mn : collection.label_en;
  return {
    title: `${name} — HEIR`,
    description: locale === "mn"
      ? `${name} цуглуулгын бараанууд`
      : `Shop the ${name} collection`,
    openGraph: {
      title: `${name} — HEIR`,
      images: [{ url: collection.imageUrl }],
    },
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { locale, slug } = await params;
  await getTranslations({ locale });
  const isMn = locale === "mn";

  const config = await getConfig();
  const collection = config.collections.find((c) => c.slug === slug);
  if (!collection) notFound();

  const supabase = await createClient();
  let products: ProductCardData[] = [];

  if (collection.productIds.length > 0) {
    // Fetch curated products and restore their defined order
    const { data: rawProducts } = await supabase
      .from("products")
      .select("id, slug, name_en, name_mn, brand, base_price, compare_at_price, images")
      .in("id", collection.productIds)
      .eq("is_active", true);

    const mapped: ProductCardData[] = (rawProducts ?? []).map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name_en,
      nameMn: p.name_mn,
      brand: p.brand,
      price: p.base_price,
      compareAtPrice: p.compare_at_price,
      image: p.images?.[0] ?? "",
      images: p.images ?? [],
    }));

    products = collection.productIds
      .map((id) => mapped.find((p) => p.id === id))
      .filter((p): p is ProductCardData => p !== undefined);
  } else {
    // No curation yet — show all active products
    const { data: rawProducts } = await supabase
      .from("products")
      .select("id, slug, name_en, name_mn, brand, base_price, compare_at_price, images")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    products = (rawProducts ?? []).map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name_en,
      nameMn: p.name_mn,
      brand: p.brand,
      price: p.base_price,
      compareAtPrice: p.compare_at_price,
      image: p.images?.[0] ?? "",
      images: p.images ?? [],
    }));
  }

  const collectionName = isMn ? collection.label_mn : collection.label_en;

  return (
    <main>
      {/* ── Banner ── */}
      <div className="relative h-[40vh] min-h-[280px] bg-[#f5f5f5] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={collection.imageUrl}
          alt={collectionName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute bottom-8 left-5">
          <h1 className="text-white text-[28px] md:text-[36px] font-normal leading-[1.2]">
            {collectionName}
          </h1>
        </div>
      </div>

      {/* ── Breadcrumb + count ── */}
      <div className="px-5 pt-8 pb-4 flex items-center justify-between">
        <nav className="flex items-center gap-2 text-[11px] text-gray-500">
          <Link href={`/${locale}`} className="hover:text-black transition-colors">
            {isMn ? "Нүүр" : "Home"}
          </Link>
          <span>/</span>
          <span className="text-black">{collectionName}</span>
        </nav>
        <p className="text-[11px] text-gray-500">
          {products.length} {isMn ? "бараа" : "items"}
        </p>
      </div>

      {/* ── Product grid ── */}
      <div className="px-5 pb-16">
        <ProductGrid products={products} locale={locale} />

        {products.length === 0 && (
          <div className="border border-dashed border-gray-200 rounded p-12 text-center mt-4">
            <p className="text-[13px] text-gray-400 mb-6">
              {isMn
                ? "Энэ цуглуулгад бараа удахгүй нэмэгдэнэ"
                : "Products coming soon to this collection"}
            </p>
            <Link
              href={`/${locale}/store`}
              className="inline-block border border-black rounded-full px-6 py-2.5 text-[12px] tracking-wide hover:bg-black hover:text-white transition-colors"
            >
              {isMn ? "Дэлгүүр үзэх" : "Browse Store"}
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
