"use client";

import { useCart } from "@/lib/cart-context";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { X } from "lucide-react";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";

export function CartDrawer() {
  const t = useTranslations("cart");
  const { items, isOpen, closeCart, itemCount } = useCart();
  const params = useParams();
  const locale = (params.locale as string) ?? "mn";

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-white z-50 flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-[50px] border-b border-gray-100 shrink-0">
          <h2 className="text-[13px] font-medium">
            {t("title")} ({itemCount})
          </h2>
          <button
            onClick={closeCart}
            className="hover:opacity-60 transition-opacity"
            aria-label={t("title")}
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-[13px] text-gray-400">{t("empty")}</p>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <CartItem key={item.id} item={item} locale={locale} />
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {items.length > 0 && (
          <div className="px-5 pb-6 shrink-0">
            <CartSummary />
          </div>
        )}
      </div>
    </>
  );
}
