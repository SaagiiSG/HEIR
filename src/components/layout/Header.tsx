"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart-context";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ShoppingBag, Search, Menu } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const t = useTranslations();
  const { itemCount, openCart } = useCart();
  const params = useParams();
  const locale = (params.locale as string) ?? "mn";
  const [mobileOpen, setMobileOpen] = useState(false);
  // undefined = loading, null = logged out, User = logged in
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <header className="bg-white border-b border-gray-100">
        {/* Skip navigation link — only visible on focus */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:bg-black focus:text-white focus:px-4 focus:py-2 focus:text-[12px] focus:rounded"
        >
          Skip to content
        </a>

        <div className="flex items-center justify-between px-5 h-[50px]">

          {/* Left — desktop nav / mobile hamburger */}
          <div className="flex-1 flex items-center gap-5 text-[12px]">
            <button
              className="md:hidden hover:opacity-60 transition-opacity"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <div className="hidden md:flex items-center gap-5">
              <Link href={`/${locale}/store`} className="whitespace-nowrap hover:opacity-60 transition-opacity">
                {t("nav.store")}
              </Link>
              <Link href={`/${locale}/store/featured`} className="whitespace-nowrap hover:opacity-60 transition-opacity">
                {t("nav.features")}
              </Link>
            </div>
          </div>

          {/* Logo */}
          <div className="text-center">
            <Link
              href={`/${locale}`}
              className="text-[15px] font-medium tracking-[0.12em] uppercase"
            >
              HEIR
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex-1 flex items-center gap-4 text-[12px] justify-end">
            <LanguageSwitcher />
            {/* Auth link: skeleton during loading to prevent layout shift */}
            <div className="hidden md:block">
              {user === undefined ? (
                <div className="h-3 w-10 bg-gray-100 rounded animate-pulse" />
              ) : user ? (
                <Link href={`/${locale}/account`} className="whitespace-nowrap hover:opacity-60 transition-opacity">
                  {t("common.account")}
                </Link>
              ) : (
                <Link href={`/${locale}/login`} className="whitespace-nowrap hover:opacity-60 transition-opacity">
                  {t("common.login")}
                </Link>
              )}
            </div>
            <button className="hover:opacity-60 transition-opacity" aria-label={t("common.search")}>
              <Search className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={openCart}
              className="relative hover:opacity-60 transition-opacity"
              aria-label={t("common.cart")}
            >
              <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} user={user ?? null} />
    </>
  );
}
