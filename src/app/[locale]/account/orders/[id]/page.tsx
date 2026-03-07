import { getTranslations } from "next-intl/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

interface OrderDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!order) notFound();

  type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

  return (
    <main className="px-5 py-12 max-w-[700px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-normal mb-1">
            {t("checkout.orderNumber")}: <span className="font-mono text-[18px]">{id.slice(0, 8).toUpperCase()}</span>
          </h1>
          <p className="text-[12px] text-gray-400">
            {new Date(order.created_at).toLocaleDateString(locale === "mn" ? "mn-MN" : "en-US", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>
        <Link href={`/${locale}/account/orders`} className="text-[12px] text-gray-500 hover:text-black transition-colors">
          ← {t("common.back")}
        </Link>
      </div>

      {/* Status */}
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
        <span className="text-[12px] text-gray-500">{t("account.orderStatus")}:</span>
        <StatusBadge status={order.status as OrderStatus} label={order.status} />
      </div>

      {/* Items */}
      <div className="mb-8">
        <h2 className="text-[13px] uppercase tracking-wide text-gray-400 mb-4">
          {locale === "mn" ? "Захиалсан бараа" : "Items"}
        </h2>
        <div className="space-y-4">
          {(order.order_items ?? []).map((item: {
            id: string;
            product_name_en: string;
            product_name_mn: string;
            size: string;
            color: string;
            quantity: number;
            price: number;
          }) => (
            <div key={item.id} className="flex justify-between items-start py-3 border-b border-gray-100">
              <div>
                <p className="text-[13px]">
                  {locale === "mn" ? item.product_name_mn : item.product_name_en}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {item.size}{item.color ? ` / ${item.color}` : ""} · x{item.quantity}
                </p>
              </div>
              <p className="text-[13px]">{formatPrice(item.price * item.quantity, locale as "mn" | "en")}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="space-y-2 text-[13px]">
        <div className="flex justify-between text-gray-500">
          <span>{t("cart.subtotal")}</span>
          <span>{formatPrice(order.subtotal, locale as "mn" | "en")}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>{t("cart.shipping")}</span>
          <span>{order.shipping === 0 ? t("cart.free") : formatPrice(order.shipping, locale as "mn" | "en")}</span>
        </div>
        <div className="flex justify-between font-medium pt-2 border-t border-gray-200">
          <span>{t("cart.total")}</span>
          <span>{formatPrice(order.total, locale as "mn" | "en")}</span>
        </div>
      </div>

      {/* Shipping address */}
      {order.shipping_address1 && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h2 className="text-[13px] uppercase tracking-wide text-gray-400 mb-3">
            {t("checkout.address")}
          </h2>
          <p className="text-[13px] leading-[1.8]">
            {order.shipping_first_name} {order.shipping_last_name}<br />
            {order.shipping_phone}<br />
            {order.shipping_address1}<br />
            {order.shipping_district}, {order.shipping_city}
            {order.shipping_postal_code ? `, ${order.shipping_postal_code}` : ""}
          </p>
        </div>
      )}
    </main>
  );
}
