"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";

export function Footer() {
  const t = useTranslations("footer");
  const params = useParams();
  const locale = (params.locale as string) ?? "mn";

  return (
    <footer className="border-t border-gray-200 px-5 py-10">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-5 gap-y-8 text-[11px] leading-[1.8]">

        {/* Newsletter */}
        <div className="col-span-2 sm:col-span-3 md:col-span-1">
          <p className="mb-3 font-medium">{t("newsletter")}</p>
          <div className="flex gap-0">
            <input
              type="email"
              placeholder={t("newsletterPlaceholder")}
              className="border border-gray-300 border-r-0 px-3 py-1.5 text-[11px] flex-1 outline-none focus:border-black transition-colors min-w-0"
            />
            <button className="border border-gray-300 px-3 py-1.5 text-[11px] hover:bg-black hover:text-white hover:border-black transition-colors shrink-0">
              {t("newsletterCta")}
            </button>
          </div>
        </div>

        {/* Brand links */}
        <div>
          <Link href={`/${locale}/about`} className="block mb-1 hover:opacity-60 transition-opacity">{t("links.about")}</Link>
          <Link href={`/${locale}/store`} className="block mb-1 hover:opacity-60 transition-opacity">{t("links.store")}</Link>
          <Link href={`/${locale}/store`} className="block mb-1 hover:opacity-60 transition-opacity">{t("links.collections")}</Link>
          <Link href={`/${locale}/stockists`} className="block mb-1 hover:opacity-60 transition-opacity">{t("links.stockists")}</Link>
        </div>

        {/* Support */}
        <div>
          <Link href={`/${locale}/shopping-guide`} className="block mb-1 hover:opacity-60 transition-opacity">{t("links.shoppingGuide")}</Link>
          <Link href={`/${locale}/contact`} className="block mb-1 hover:opacity-60 transition-opacity">{t("links.contact")}</Link>
          <Link href={`/${locale}/sustainability`} className="block mb-1 hover:opacity-60 transition-opacity">{t("links.sustainability")}</Link>
          <Link href={`/${locale}/legal`} className="block mb-1 hover:opacity-60 transition-opacity">{t("links.legal")}</Link>
        </div>

        {/* Social */}
        <div>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="block mb-1 hover:opacity-60 transition-opacity">{t("links.instagram")}</a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="block mb-1 hover:opacity-60 transition-opacity">{t("links.facebook")}</a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="block mb-1 hover:opacity-60 transition-opacity">{t("links.youtube")}</a>
        </div>

        {/* Meta */}
        <div className="md:text-right">
          <p className="mb-1">{locale === "mn" ? "MN" : "EN"} · MNT</p>
          <p className="mt-4 text-gray-400">{t("copyright")}</p>
        </div>

      </div>
    </footer>
  );
}
