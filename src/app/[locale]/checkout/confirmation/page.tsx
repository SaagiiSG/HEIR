import { getTranslations } from "next-intl/server";
import Link from "next/link";

interface ConfirmationPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string; method?: string }>;
}

export default async function ConfirmationPage({
  params,
  searchParams,
}: ConfirmationPageProps) {
  const { locale } = await params;
  const { order, method } = await searchParams;
  const t = await getTranslations({ locale, namespace: "checkout" });

  return (
    <main className="px-5 py-20 max-w-[500px] mx-auto text-center">
      <div className="mb-8">
        <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center mx-auto mb-6">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-[22px] font-normal mb-3">{t("orderConfirmed")}</h1>
        <p className="text-[13px] text-gray-500">{t("thankYou")}</p>
      </div>

      {order && (
        <p className="text-[13px] mb-6">
          {t("orderNumber")}: <span className="font-medium">{order}</span>
        </p>
      )}

      {method !== "byl" && (
        <div className="border border-black px-5 py-4 mb-8 text-left">
          <p className="text-[11px] uppercase tracking-wide font-medium mb-2">
            {locale === "mn" ? "ЧУХАЛ МЭДЭЭЛЭЛ" : "IMPORTANT"}
          </p>
          <p className="text-[12px] leading-relaxed">
            {locale === "mn"
              ? "ТӨЛБӨР ШИЛЖҮҮЛСНИЙ ДАРАА @heir.rchive ГЭСЭН ИНСТАГРАМ ХАЯГРУУ ГҮЙЛГЭЭНИЙ SCREENSHOT ИЛГЭЭЖ ЗАХИАЛГА БАТАЛГААЖСАН ЭСЭХИЙГ ШАЛГАНА УУ!"
              : "Please send your payment screenshot to @heir.rchive on Instagram to confirm your order."}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 items-center">
        <Link
          href={`/${locale}/account/orders`}
          className="inline-block border border-black rounded-full px-6 py-2.5 text-[12px] tracking-wide hover:bg-black hover:text-white transition-colors"
        >
          {locale === "mn" ? "Захиалга харах" : "View Orders"}
        </Link>
        <Link
          href={`/${locale}/store`}
          className="text-[12px] text-gray-500 hover:text-black transition-colors"
        >
          {locale === "mn" ? "Дэлгүүрлэлт үргэлжлүүлэх" : "Continue Shopping"}
        </Link>
      </div>
    </main>
  );
}
