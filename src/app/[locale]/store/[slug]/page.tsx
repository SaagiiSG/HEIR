import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { ReviewSection } from "@/components/product/ReviewSection";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { ProductCardData } from "@/components/product/ProductCard";

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

const FIELDS = "id, slug, name_en, name_mn, brand, base_price, compare_at_price, images" as const;
const FALLBACK_IMAGE = "https://placehold.co/600x800/f5f5f5/cccccc";

function mapToCard(p: {
  id: string; slug: string; name_en: string; name_mn: string;
  brand: string; base_price: number; compare_at_price: number | null;
  images: string[] | null;
}): ProductCardData {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name_en,
    nameMn: p.name_mn,
    brand: p.brand,
    price: p.base_price,
    compareAtPrice: p.compare_at_price,
    image: p.images?.[0] ?? "",
    images: p.images ?? [],
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  const isMn = locale === "mn";

  const supabase = await createClient();

  // Fetch product first (need its id + category_id for subsequent queries)
  const { data: product } = await supabase
    .from("products")
    .select("id, slug, name_en, name_mn, brand, base_price, compare_at_price, description_en, description_mn, images, category_id")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  // Now fetch variants, color images, and recommendations in parallel
  const [{ data: variantsRaw }, { data: colorImagesRaw }, catRaw, fillRaw] = await Promise.all([
    supabase
      .from("product_variants")
      .select("id, size, color, color_hex, stock")
      .eq("product_id", product.id)
      .order("size"),
    supabase
      .from("product_images")
      .select("url, color_hex, sort_order")
      .eq("product_id", product.id)
      .order("sort_order"),
    product.category_id
      ? supabase
          .from("products")
          .select(FIELDS)
          .eq("is_active", true)
          .eq("category_id", product.category_id)
          .neq("id", product.id)
          .order("created_at", { ascending: false })
          .limit(8)
      : Promise.resolve({ data: [] as { id: string; slug: string; name_en: string; name_mn: string; brand: string; base_price: number; compare_at_price: number | null; images: string[] | null }[] }),
    supabase
      .from("products")
      .select(FIELDS)
      .eq("is_active", true)
      .neq("id", product.id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const catProducts = (catRaw?.data ?? []).map(mapToCard);
  const fillProducts = (fillRaw?.data ?? [])
    .filter((p) => !catProducts.some((c: ProductCardData) => c.id === p.id))
    .map(mapToCard);

  const justForYou = [...catProducts, ...fillProducts].slice(0, 8);

  // Build color image map and gallery images
  const colorImageMap: Record<string, string[]> = {};
  for (const img of colorImagesRaw ?? []) {
    if (img.color_hex) {
      (colorImageMap[img.color_hex] ??= []).push(img.url);
    }
  }

  // Gallery: use product_images table if populated, else fallback to products.images TEXT[]
  let galleryImagesWithColor: { url: string; color_hex: string | null }[];
  if (colorImagesRaw && colorImagesRaw.length > 0) {
    galleryImagesWithColor = colorImagesRaw.map((i) => ({ url: i.url, color_hex: i.color_hex ?? null }));
  } else {
    const urls = (product.images ?? [] as string[]).filter(
      (s: unknown): s is string => typeof s === "string" && s.startsWith("https://")
    );
    galleryImagesWithColor = urls.map((url: string) => ({ url, color_hex: null }));
  }
  if (galleryImagesWithColor.length === 0) galleryImagesWithColor.push({ url: FALLBACK_IMAGE, color_hex: null });
  const galleryImages = galleryImagesWithColor.map((i) => i.url);

  const variants = variantsRaw ?? [];

  const productForClient = {
    id: product.id,
    slug: product.slug,
    name: product.name_en,
    nameMn: product.name_mn,
    price: product.base_price,
    compareAtPrice: product.compare_at_price ?? null,
    images: product.images ?? [],
    brand: product.brand,
    descriptionEn: product.description_en ?? null,
    descriptionMn: product.description_mn ?? null,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: isMn ? product.name_mn : product.name_en,
    description: isMn ? product.description_mn : product.description_en,
    image: galleryImages,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      price: product.base_price,
      priceCurrency: "MNT",
      availability:
        variants.some((v) => v.stock > 0)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://heir.mn"}/${locale}/store/${product.slug}`,
    },
  };

  return (
    <main id="main-content" className="px-5 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        galleryImages={galleryImagesWithColor}
        colorImageMap={colorImageMap}
        alt={isMn ? product.name_mn : product.name_en}
        product={productForClient}
        variants={variants}
        locale={locale}
        isMn={isMn}
      />

      {/* ── Just for you ── */}
      {justForYou.length > 0 && (
        <div className="max-w-[1100px] mx-auto mt-20 border-t border-gray-100 pt-10">
          <h2 className="text-[22px] font-normal mb-8">
            {isMn ? "Таньд зориулж" : "Just for you"}
          </h2>
          <ProductGrid products={justForYou} locale={locale} />
        </div>
      )}

      {/* ── Reviews ── */}
      <div className="max-w-[1100px] mx-auto px-0">
        <ReviewSection productId={product.id} locale={locale} />
      </div>
    </main>
  );
}
