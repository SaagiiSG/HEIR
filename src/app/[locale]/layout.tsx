import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { CartProvider } from "@/lib/cart-context";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { PageTransitionWrapper } from "@/components/ui/PageTransitionWrapper";
import { getSiteSettings } from "@/lib/actions/settings";
import { notFound } from "next/navigation";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://heir.mn";
  return {
    title: {
      default: t("brand"),
      template: `%s — ${t("brand")}`,
    },
    description: t("tagline"),
    metadataBase: new URL(siteUrl),
    openGraph: {
      siteName: t("brand"),
      locale: locale === "mn" ? "mn_MN" : "en_US",
      type: "website",
    },
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        mn: `${siteUrl}/mn`,
        en: `${siteUrl}/en`,
      },
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "mn" | "en")) {
    notFound();
  }

  const messages = await getMessages();

  // Fetch announcement — only shown if admin has set non-empty text
  const settings = await getSiteSettings();
  const announcement = (locale === "mn" ? settings.announcement_mn : settings.announcement_en).trim();
  const hasAnnouncement = announcement.length > 0;

  // Announcement bar is 34px, header is 50px
  const topOffset = hasAnnouncement ? "pt-[84px]" : "pt-[50px]";

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              {/* Fixed top chrome: optional announcement bar + header */}
              <div className="fixed top-0 left-0 right-0 z-50">
                {hasAnnouncement && <AnnouncementBar text={announcement} />}
                <Header />
              </div>

              <div id="main-content" className={`${topOffset} flex-1`}>
                <PageTransitionWrapper>{children}</PageTransitionWrapper>
              </div>
              <Footer />
            </div>
            <CartDrawer />
          </CartProvider>
        </NextIntlClientProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
