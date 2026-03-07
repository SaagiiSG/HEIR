import { getTranslations } from "next-intl/server";
import { DropCard, type DropCardData } from "@/components/drops/DropCard";
import type { Metadata } from "next";

interface DropsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: DropsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "mn" ? "Drops" : "Drops",
    description:
      locale === "mn"
        ? "Хязгаарлагдмал цуглуулга — HEIR-ийн онцгой DropS"
        : "Limited drops — exclusive releases from HEIR",
  };
}

export default async function DropsPage({ params }: DropsPageProps) {
  const { locale } = await params;
  await getTranslations({ locale });

  // TODO: Fetch drops from Supabase
  // const supabase = await createClient();
  // const { data: drops } = await supabase
  //   .from('drops')
  //   .select('*, drop_products(count)')
  //   .order('starts_at', { ascending: false });
  const drops: DropCardData[] = [];

  const activeDrops = drops.filter((d) => d.is_active && (!d.ends_at || new Date(d.ends_at) > new Date()));
  const upcomingDrops = drops.filter((d) => !d.is_active && new Date(d.starts_at) > new Date());
  const pastDrops = drops.filter((d) => d.ends_at && new Date(d.ends_at) < new Date());

  return (
    <main className="px-5 py-12 max-w-[1100px] mx-auto">
      <h1 className="text-[22px] font-normal mb-10">Drops</h1>

      {/* Active */}
      {activeDrops.length > 0 && (
        <section className="mb-16">
          <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-6">
            {locale === "mn" ? "Одоо нээлттэй" : "Live Now"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activeDrops.map((drop) => (
              <DropCard key={drop.id} drop={drop} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming */}
      {upcomingDrops.length > 0 && (
        <section className="mb-16">
          <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-6">
            {locale === "mn" ? "Удахгүй" : "Coming Soon"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingDrops.map((drop) => (
              <DropCard key={drop.id} drop={drop} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* Past */}
      {pastDrops.length > 0 && (
        <section>
          <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-6">
            {locale === "mn" ? "Дууссан" : "Past Drops"}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {pastDrops.map((drop) => (
              <DropCard key={drop.id} drop={drop} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {drops.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-[15px] text-gray-400 mb-2">
            {locale === "mn" ? "Drops удахгүй нэмэгдэнэ" : "Drops coming soon"}
          </p>
          <p className="text-[11px] text-gray-300">TODO: fetch from Supabase</p>
        </div>
      )}
    </main>
  );
}
