"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchLocale(newLocale: string) {
    if (newLocale === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  }

  return (
    <div className="flex items-center gap-1 text-[12px]">
      {routing.locales.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span className="text-gray-300 mx-1">|</span>}
          <button
            onClick={() => switchLocale(l)}
            disabled={isPending}
            className={`uppercase transition-opacity ${
              locale === l ? "font-medium" : "text-gray-400 hover:opacity-60"
            } ${isPending ? "opacity-40" : ""}`}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
