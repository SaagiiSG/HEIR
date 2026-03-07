"use client";

import { useCart } from "@/lib/cart-context";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

export function CartSummary() {
  const t = useTranslations("cart");
  const { subtotal } = useCart();
  const params = useParams();
  const locale = (params.locale as string) ?? "mn";

  return (
    <div className="border-t border-gray-200 pt-4 space-y-3">
      <div className="flex justify-between text-[12px]">
        <span>{t("subtotal")}</span>
        <span>{formatPrice(subtotal, locale as "mn" | "en")}</span>
      </div>
      <div className="flex justify-between text-[12px] text-gray-500">
        <span>{t("shipping")}</span>
        <span>{t("free")}</span>
      </div>
      <div className="flex justify-between text-[13px] font-medium border-t border-gray-200 pt-3">
        <span>{t("total")}</span>
        <span>{formatPrice(subtotal, locale as "mn" | "en")}</span>
      </div>

      <Link
        href={`/${locale}/checkout`}
        className="block w-full bg-black text-white text-center py-3 text-[12px] tracking-wide hover:bg-gray-800 transition-colors mt-4"
      >
        {t("checkout")}
      </Link>

      <Link
        href={`/${locale}/store`}
        className="block w-full text-center py-2 text-[11px] text-gray-500 hover:text-black transition-colors"
      >
        {t("continueShopping")}
      </Link>
    </div>
  );
}
