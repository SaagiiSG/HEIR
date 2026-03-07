"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import Link from "next/link";

export default function CartPage() {
  const t = useTranslations("cart");
  const params = useParams();
  const locale = (params.locale as string) ?? "mn";
  const { items, itemCount } = useCart();

  return (
    <main className="px-5 py-12 max-w-[900px] mx-auto">
      <h1 className="text-[22px] font-normal mb-8">
        {t("title")} ({itemCount})
      </h1>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-[15px] text-gray-400 mb-6">{t("empty")}</p>
          <Link
            href={`/${locale}/store`}
            className="inline-block border border-black rounded-full px-6 py-2.5 text-[12px] tracking-wide hover:bg-black hover:text-white transition-colors"
          >
            {t("continueShopping")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-12">
          <div>
            {items.map((item) => (
              <CartItem key={item.id} item={item} locale={locale} />
            ))}
          </div>
          <div>
            <CartSummary />
          </div>
        </div>
      )}
    </main>
  );
}
