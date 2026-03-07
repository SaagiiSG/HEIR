import { createClient } from "@/lib/supabase/server";
import { FeaturedProductCard } from "@/components/product/FeaturedProductCard";

interface FeaturedPageProps {
  params: Promise<{ locale: string }>;
}

export default async function FeaturedPage({ params }: FeaturedPageProps) {
  const { locale } = await params;
  const isMn = locale === "mn";

  const supabase = await createClient();
  const { data: raw } = await supabase
    .from("products")
    .select("id, slug, name_en, name_mn, brand, base_price, compare_at_price, images")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(20);

  const products = (raw ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name_en,
    nameMn: p.name_mn,
    brand: p.brand,
    price: p.base_price,
    compareAtPrice: p.compare_at_price,
    image: (p.images as string[] | null)?.[0] ?? "",
  }));

  return (
    <main id="main-content">
      {/* Full-bleed black hero */}
      <section className="bg-black text-white flex flex-col items-center justify-center text-center px-5"
        style={{ minHeight: "42vh" }}
      >
        <h1
          className="font-normal tracking-tight leading-none mb-4"
          style={{ fontSize: "clamp(56px, 10vw, 120px)" }}
        >
          {isMn ? "Онцлох" : "Featured"}
        </h1>
        <p className="text-[13px] text-gray-400 max-w-xs leading-relaxed">
          {isMn
            ? "Манай хамгийн онцлох бүтээгдэхүүнүүд"
            : "A curated selection of our finest pieces"}
        </p>
      </section>

      {/* Product grid */}
      <section className="max-w-[1200px] mx-auto px-5 py-16">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-[13px] text-gray-400">
              {isMn ? "Онцлох бараа байхгүй байна" : "No featured products yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12">
            {products.map((product) => (
              <FeaturedProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
