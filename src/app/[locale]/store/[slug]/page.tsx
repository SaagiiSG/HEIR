import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { ProductActions } from "@/components/product/ProductActions";
import { ReviewSection } from "@/components/product/ReviewSection";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
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

  // Now fetch variants + recommendations in parallel (product.id is known)
  const [{ data: variantsRaw }, catRaw, fillRaw] = await Promise.all([
    supabase
      .from("product_variants")
      .select("id, size, color, color_hex, stock")
      .eq("product_id", product.id)
      .order("size"),
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

  const galleryImages = (product.images ?? [] as string[]).filter(
    (s: unknown): s is string => typeof s === "string" && s.startsWith("https://")
  );
  if (galleryImages.length === 0) galleryImages.push(FALLBACK_IMAGE);

  const variants = variantsRaw ?? [];

  const productForActions = {
    id: product.id,
    slug: product.slug,
    name: product.name_en,
    nameMn: product.name_mn,
    price: product.base_price,
    images: product.images ?? [],
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-[1100px] mx-auto">
        {/* ── Image gallery ── */}
        <ProductImageGallery
          images={galleryImages}
          alt={isMn ? product.name_mn : product.name_en}
        />

        {/* ── Product info — sticky on desktop ── */}
        <div className="space-y-6 md:pt-4 md:sticky md:top-6 md:self-start">
          <div>
            <p className="text-[11px] text-gray-500 mb-2">{product.brand}</p>
            <h1 className="text-[20px] font-normal mb-3">
              {isMn ? product.name_mn : product.name_en}
            </h1>
            <div className="flex items-baseline gap-3">
              {product.compare_at_price && product.compare_at_price > product.base_price && (
                <span className="text-[15px] text-gray-400 line-through">
                  {formatPrice(product.compare_at_price, locale as "mn" | "en")}
                </span>
              )}
              <span className="text-[17px]">
                {formatPrice(product.base_price, locale as "mn" | "en")}
              </span>
            </div>
          </div>

          <ProductActions
            product={productForActions}
            variants={variants}
            locale={locale}
            isMn={isMn}
          />

          <div className="border-t border-gray-100 pt-6">
            <p className="text-[11px] uppercase tracking-wide mb-2">
              {isMn ? "Тайлбар" : "Description"}
            </p>
            <p className="text-[13px] leading-[1.7]">
              {isMn ? product.description_mn : product.description_en}
            </p>
          </div>
        </div>
      </div>

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
