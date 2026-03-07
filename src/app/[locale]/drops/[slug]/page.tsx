import { getTranslations } from "next-intl/server";
import { Countdown } from "@/components/drops/Countdown";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { ProductCardData } from "@/components/product/ProductCard";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";

interface DropDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// Placeholder — TODO replace with Supabase fetch
const MOCK_DROP = {
  id: "1",
  slug: "ss26-launch",
  title_mn: "SS26 Нээлт",
  title_en: "SS26 Launch",
  description_mn:
    "2026 оны хавар-зуны цуглуулгын нээлт. Монгол ноосоор хийсэн онцгой загварууд.",
  description_en:
    "The launch of our Spring/Summer 2026 collection. Exclusive pieces crafted from Mongolian wool.",
  image_url: "",
  starts_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  ends_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
  is_active: false,
};

export async function generateMetadata({ params }: DropDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  // TODO: fetch real drop metadata from Supabase
  const title = locale === "mn" ? MOCK_DROP.title_mn : MOCK_DROP.title_en;
  const description = locale === "mn" ? MOCK_DROP.description_mn : MOCK_DROP.description_en;
  return {
    title,
    description,
    openGraph: { title, description, images: MOCK_DROP.image_url ? [MOCK_DROP.image_url] : [] },
  };
}

export default async function DropDetailPage({ params }: DropDetailPageProps) {
  const { locale, slug } = await params;
  await getTranslations({ locale });

  // TODO: Fetch drop from Supabase by slug
  // const supabase = await createClient();
  // const { data: drop } = await supabase.from('drops').select('*, drop_products(products(*))').eq('slug', slug).single();
  // if (!drop) notFound();

  const drop = MOCK_DROP.slug === slug ? MOCK_DROP : null;
  if (!drop) notFound();

  const title = locale === "mn" ? drop.title_mn : drop.title_en;
  const description = locale === "mn" ? drop.description_mn : drop.description_en;
  const isUpcoming = new Date(drop.starts_at) > new Date();
  const isLive = drop.is_active && (!drop.ends_at || new Date(drop.ends_at) > new Date());

  const products: ProductCardData[] = []; // TODO: from drop.drop_products

  return (
    <main>
      {/* Drop hero */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[70vh]">
        {/* Left — info */}
        <div className="flex flex-col justify-end px-5 md:px-10 pb-12 pt-16 bg-white">
          {isLive && (
            <span className="inline-block bg-black text-white text-[10px] uppercase tracking-widest px-3 py-1 mb-6 w-fit">
              {locale === "mn" ? "Нээлттэй байна" : "Live Now"}
            </span>
          )}

          <h1 className="text-[32px] md:text-[40px] font-normal leading-[1.1] mb-4">{title}</h1>
          <p className="text-[13px] leading-[1.8] text-gray-600 max-w-sm mb-8">{description}</p>

          {isUpcoming && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                {locale === "mn" ? "Эхлэх хүртэл" : "Starts in"}
              </p>
              <Countdown targetDate={drop.starts_at} locale={locale} />
            </div>
          )}

          {drop.ends_at && isLive && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                {locale === "mn" ? "Дуусах хүртэл" : "Ends in"}
              </p>
              <Countdown targetDate={drop.ends_at} locale={locale} />
            </div>
          )}
        </div>

        {/* Right — image */}
        <div className="bg-[#1a1a2e] relative min-h-[50vw] md:min-h-0">
          {drop.image_url ? (
            <Image
              src={drop.image_url}
              alt={title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white/20 text-[11px] uppercase tracking-widest">{title}</p>
            </div>
          )}
        </div>
      </section>

      {/* Products in this drop */}
      {(isLive || !isUpcoming) && (
        <section className="px-5 py-14 border-t border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[20px] font-normal">
              {locale === "mn" ? "Энэ Drop-ийн бараа" : "In This Drop"}
            </h2>
            <p className="text-[11px] text-gray-400">
              {products.length} {locale === "mn" ? "бараа" : "items"}
            </p>
          </div>
          <ProductGrid products={products} locale={locale} />
          {products.length === 0 && (
            <p className="text-[11px] text-gray-300 text-center font-mono mt-4">
              TODO: fetch drop products from Supabase
            </p>
          )}
        </section>
      )}
    </main>
  );
}
