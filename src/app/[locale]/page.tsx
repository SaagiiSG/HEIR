import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { LandingPageConfig } from "@/lib/landing-page-types";
import { DEFAULT_CONFIG } from "@/lib/landing-page-types";
import { FadeIn } from "@/components/ui/FadeIn";
import { Accordion } from "@/components/ui/Accordion";

export const revalidate = 60;

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: t("common.brand"),
    description: t("common.tagline"),
    openGraph: {
      title: t("common.brand"),
      description: t("common.tagline"),
    },
  };
}


function PillLink({ children, href = "#" }: { children: React.ReactNode; href?: string }) {
  return (
    <Link
      href={href}
      className="inline-block border border-solid border-black rounded-full px-6 py-2.5 text-[12px] tracking-wide w-fit hover:bg-black hover:text-white transition-colors"
    >
      {children}
    </Link>
  );
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const isMn = locale === "mn";

  // Load published landing page config from Supabase, fall back to defaults
  let config: LandingPageConfig = DEFAULT_CONFIG;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("landing_page_config")
      .select("config")
      .eq("id", "published")
      .single();
    if (data?.config) {
      const loaded = data.config as LandingPageConfig;
      config = { ...DEFAULT_CONFIG, ...loaded, hero: { ...DEFAULT_CONFIG.hero, ...loaded.hero } };
    }
  } catch {
    // silent fallback to DEFAULT_CONFIG
  }

  return (
    <>
      {/* ── Hero ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 md:min-h-[85vh]">
        <div className="flex flex-col justify-end px-5 pb-16 pt-10 md:pt-10 order-2 md:order-1">
          <h1 className="text-[24px] sm:text-[40px] md:text-[64px] lg:text-[98px] font-normal leading-[1.2] mb-2 whitespace-pre-line">
            {isMn ? (config.hero.heading_mn || t("hero.title")) : (config.hero.heading_en || t("hero.title"))}
          </h1>
          <p className="text-[18px] text-black mb-8 mt-2">
            {isMn ? (config.hero.subtitle_mn || t("hero.subtitle")) : (config.hero.subtitle_en || t("hero.subtitle"))}
          </p>
          <PillLink href={`/${locale}/store`}>
            {isMn ? (config.hero.cta_mn || t("hero.cta")) : (config.hero.cta_en || t("hero.cta"))}
          </PillLink>
        </div>
        <div className="bg-[#1a1a2e] relative aspect-[4/5] md:aspect-auto md:min-h-0 order-1 md:order-2">
          <Image
            src={config.hero.imageUrl}
            alt={config.hero.imageAlt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </section>

      {/* ── New In ── */}
      <FadeIn>
      <section className="px-5 py-14 border-t border-gray-200">
        {/* Mobile title — hidden on desktop */}
        <div className="mb-6 md:hidden">
          <h2 className="text-[26px] font-normal leading-[1.15] mb-6">{t("newIn.title")}</h2>
          <PillLink href={`/${locale}/store`}>{t("newIn.cta")}</PillLink>
        </div>

        {/* Row 1: desktop col1=title + products 1-3; mobile: products 1-3 in 2-col */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 mb-5">
          <div className="hidden md:flex flex-col pr-4">
            <h2 className="text-[26px] font-normal leading-[1.15] mb-6">{t("newIn.title")}</h2>
            <PillLink href={`/${locale}/store`}>{t("newIn.cta")}</PillLink>
          </div>
          {config.newIn.slice(0, 3).map((slot, i) => (
            <FadeIn key={slot.productId ?? i} delay={[0, 0.1, 0.18, 0.36][i % 4]}>
              {slot.productId ? (
                <Link href={`/${locale}/store/${slot.productSlug}`} className="group block">
                  <div className="aspect-square bg-[#f5f5f5] mb-3 overflow-hidden relative">
                    <Image
                      src={slot.productImageUrl || "https://placehold.co/400x400/f5f5f5/cccccc"}
                      alt={isMn ? slot.productName_mn : slot.productName_en}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[11px]">heir</span>
                    <div className="flex items-center gap-1.5">
                      {slot.productCompareAtPrice && slot.productCompareAtPrice > slot.productPrice && (
                        <span className="text-[11px] text-gray-400 line-through">₮{slot.productCompareAtPrice.toLocaleString()}</span>
                      )}
                      <span className="text-[11px]">₮{slot.productPrice.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-[11px] leading-[1.5] mb-2">{isMn ? slot.productName_mn : slot.productName_en}</p>
                  <div className="flex gap-1.5 mt-2">
                    {slot.colorSwatches.map((hex) => (
                      <span key={hex} className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: hex }} />
                    ))}
                  </div>
                </Link>
              ) : (
                <div>
                  <div className="aspect-square bg-[#f5f5f5] mb-3" />
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[11px]">heir</span>
                    <span className="text-[11px]">—</span>
                  </div>
                  <p className="text-[11px] leading-[1.5] mb-2 text-gray-400">
                    {isMn ? "Удахгүй нэмэгдэнэ" : "Coming soon"}
                  </p>
                </div>
              )}
            </FadeIn>
          ))}
        </div>

        {/* Row 2: desktop col1=spacer + products 4-6; mobile: products 4-6 in 2-col */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          <div className="hidden md:block" />
          {config.newIn.slice(3, 6).map((slot, i) => (
            <FadeIn key={slot.productId ?? i} delay={[0, 0.1, 0.18, 0.36][i % 4]}>
              {slot.productId ? (
                <Link href={`/${locale}/store/${slot.productSlug}`} className="group block">
                  <div className="aspect-square bg-[#f5f5f5] mb-3 overflow-hidden relative">
                    <Image
                      src={slot.productImageUrl || "https://placehold.co/400x400/f5f5f5/cccccc"}
                      alt={isMn ? slot.productName_mn : slot.productName_en}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[11px]">heir</span>
                    <div className="flex items-center gap-1.5">
                      {slot.productCompareAtPrice && slot.productCompareAtPrice > slot.productPrice && (
                        <span className="text-[11px] text-gray-400 line-through">₮{slot.productCompareAtPrice.toLocaleString()}</span>
                      )}
                      <span className="text-[11px]">₮{slot.productPrice.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-[11px] leading-[1.5] mb-2">{isMn ? slot.productName_mn : slot.productName_en}</p>
                  <div className="flex gap-1.5 mt-2">
                    {slot.colorSwatches.map((hex) => (
                      <span key={hex} className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: hex }} />
                    ))}
                  </div>
                </Link>
              ) : (
                <div>
                  <div className="aspect-square bg-[#f5f5f5] mb-3" />
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[11px]">heir</span>
                    <span className="text-[11px]">—</span>
                  </div>
                  <p className="text-[11px] leading-[1.5] mb-2 text-gray-400">
                    {isMn ? "Удахгүй нэмэгдэнэ" : "Coming soon"}
                  </p>
                </div>
              )}
            </FadeIn>
          ))}
        </div>
      </section>
      </FadeIn>

      {/* ── Collections ── */}
      <FadeIn>
      <section className="px-5 pt-8 pb-4 border-t border-gray-200">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {config.collections.slice(0, 4).map((col, i) => (
            <FadeIn key={col.label_en} delay={[0, 0.1, 0.18, 0.36][i % 4]}>
              <Link href={`/${locale}/collections/${col.slug}`} className="group block">
                <div className="aspect-square bg-[#f5f5f5] mb-3 overflow-hidden relative">
                  <Image
                    src={col.imageUrl}
                    alt={isMn ? col.label_mn : col.label_en}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="text-[13px] font-normal leading-[1.4]">{isMn ? col.label_mn : col.label_en}</p>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>
      <section className="px-5 pt-4 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {config.collections.slice(4, 8).map((col, i) => (
            <FadeIn key={col.label_en} delay={[0, 0.1, 0.18, 0.36][i % 4]}>
              <Link href={`/${locale}/collections/${col.slug}`} className="group block">
                <div className="aspect-square bg-[#f5f5f5] mb-3 overflow-hidden relative">
                  <Image
                    src={col.imageUrl}
                    alt={isMn ? col.label_mn : col.label_en}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="text-[13px] font-normal leading-[1.4]">{isMn ? col.label_mn : col.label_en}</p>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>
      </FadeIn>

      {/* ── Heir Exclusive ── */}
      <FadeIn>
      <section className="px-5 py-14 border-t border-gray-200">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          <div className="hidden md:flex flex-col pr-4">
            <h2 className="text-[26px] font-normal leading-[1.15] mb-6">
              {"Heir Exclusive"}
            </h2>
            <PillLink href={`/${locale}/store`}>
              {isMn ? "Бүгдийг үзэх" : "Shop All"}
            </PillLink>
          </div>
          <div className="col-span-2 mb-6 md:hidden">
            <h2 className="text-[26px] font-normal leading-[1.15] mb-6">
              {"Heir Exclusive"}
            </h2>
            <PillLink href={`/${locale}/store`}>
              {isMn ? "Бүгдийг үзэх" : "Shop All"}
            </PillLink>
          </div>
          {(config.exclusive ?? []).slice(0, 3).map((slot, i) => (
            <FadeIn key={slot.productId ?? i} delay={[0, 0.1, 0.18, 0.36][i % 4]}>
              {slot.productId ? (
                <Link href={`/${locale}/store/${slot.productSlug}`} className="group block">
                  <div className="aspect-square bg-[#f5f5f5] mb-3 overflow-hidden relative">
                    <Image
                      src={slot.productImageUrl || "https://placehold.co/400x400/f5f5f5/cccccc"}
                      alt={isMn ? slot.productName_mn : slot.productName_en}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[11px]">heir</span>
                    <div className="flex items-center gap-1.5">
                      {slot.productCompareAtPrice && slot.productCompareAtPrice > slot.productPrice && (
                        <span className="text-[11px] text-gray-400 line-through">₮{slot.productCompareAtPrice.toLocaleString()}</span>
                      )}
                      <span className="text-[11px]">₮{slot.productPrice.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-[11px] leading-[1.5] mb-2">{isMn ? slot.productName_mn : slot.productName_en}</p>
                  <div className="flex gap-1.5 mt-2">
                    {slot.colorSwatches.map((hex) => (
                      <span key={hex} className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: hex }} />
                    ))}
                  </div>
                </Link>
              ) : (
                <div>
                  <div className="aspect-square bg-[#f5f5f5] mb-3" />
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[11px]">heir</span>
                    <span className="text-[11px]">—</span>
                  </div>
                  <p className="text-[11px] leading-[1.5] mb-2 text-gray-400">
                    {isMn ? "Удахгүй нэмэгдэнэ" : "Coming soon"}
                  </p>
                </div>
              )}
            </FadeIn>
          ))}
        </div>
      </section>
      </FadeIn>

      {/* ── Featured Reviews (admin-curated) ── */}
      {(config.featuredReviews ?? []).length > 0 && (
        <FadeIn>
          <section className="px-5 py-14 border-t border-gray-200">
            <h2 className="text-[26px] font-normal leading-[1.15] mb-10">
              {isMn ? "Хэрэглэгчдийн сэтгэгдэл" : "What Our Customers Say"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(config.featuredReviews ?? []).slice(0, 6).map((review) => (
                <div key={review.reviewId} className="border border-gray-100 p-5 flex flex-col gap-3">
                  {/* Stars */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <svg
                        key={n}
                        className={`w-3.5 h-3.5 ${n <= review.rating ? "fill-black" : "fill-gray-200"}`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  {review.title && (
                    <p className="text-[13px] font-medium leading-[1.4]">{review.title}</p>
                  )}
                  <p className="text-[12px] leading-[1.7] text-gray-600 flex-1">
                    &ldquo;{review.content}&rdquo;
                  </p>
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-[11px] font-medium">{review.reviewerName}</p>
                    {review.productName_en && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {isMn ? review.productName_mn : review.productName_en}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>
      )}

      {/* ── Review Screenshots ── */}
      {(config.reviewScreenshots ?? []).length > 0 && (
        <FadeIn>
          <section className="py-14 border-t border-gray-200">
            <h2 className="text-[26px] font-normal leading-[1.15] mb-8 px-5">
              {isMn ? "Хэрэглэгчдийн зургууд" : "Customer Reviews"}
            </h2>
            <div className="flex gap-3 overflow-x-auto pl-5 pr-5 pb-2 scrollbar-hide">
              {(config.reviewScreenshots ?? []).map((shot) => (
                <div key={shot.id} className="shrink-0 w-[160px] sm:w-[200px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shot.imageUrl}
                    alt={shot.caption ?? "Customer review screenshot"}
                    className="w-full aspect-[9/16] object-cover border border-gray-100"
                  />
                  {shot.caption && (
                    <p className="text-[10px] text-gray-400 mt-2 leading-[1.4]">{shot.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </FadeIn>
      )}

      {/* ── FAQ ── */}
      {(config.faq ?? []).length > 0 && (
        <FadeIn>
          <section className="px-5 py-14 border-t border-gray-200">
            <h2 className="text-[26px] font-normal leading-[1.15] mb-10">{t("faq.title")}</h2>
            <div className="max-w-2xl">
              <Accordion items={(config.faq ?? []).map((item) => ({
                id: item.id,
                question: isMn ? item.question_mn : item.question_en,
                answer: isMn ? item.answer_mn : item.answer_en,
              }))} />
            </div>
          </section>
        </FadeIn>
      )}
    </>
  );
}
