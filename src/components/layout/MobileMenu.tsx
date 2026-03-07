"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { X } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function MobileMenu({ isOpen, onClose, user }: MobileMenuProps) {
  const t = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) ?? "mn";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex items-center justify-between px-5 h-[50px] border-b border-gray-100">
        <Link href={`/${locale}`} className="text-[15px] font-medium tracking-[0.12em] uppercase" onClick={onClose}>
          HEIR
        </Link>
        <button onClick={onClose} className="hover:opacity-60 transition-opacity" aria-label="Close menu">
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      <nav className="flex flex-col px-5 py-8 gap-6 text-[15px]">
        <Link href={`/${locale}`} onClick={onClose} className="hover:opacity-60 transition-opacity">
          {t("nav.newIn")}
        </Link>
        <Link href={`/${locale}/store`} onClick={onClose} className="hover:opacity-60 transition-opacity">
          {t("nav.store")}
        </Link>
        <Link href={`/${locale}/store/featured`} onClick={onClose} className="hover:opacity-60 transition-opacity">
          {t("nav.features")}
        </Link>
        <Link href={`/${locale}/sustainability`} onClick={onClose} className="hover:opacity-60 transition-opacity">
          {t("nav.sustainability")}
        </Link>
      </nav>

      <div className="mt-auto px-5 pb-8 flex flex-col gap-3 text-[13px]">
        {user ? (
          <Link href={`/${locale}/account`} onClick={onClose} className="hover:opacity-60 transition-opacity">
            {t("common.account")}
          </Link>
        ) : (
          <>
            <Link href={`/${locale}/login`} onClick={onClose} className="hover:opacity-60 transition-opacity">
              {t("common.login")}
            </Link>
            <Link href={`/${locale}/register`} onClick={onClose} className="hover:opacity-60 transition-opacity">
              {t("common.register")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
