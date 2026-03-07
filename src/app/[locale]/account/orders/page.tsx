import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

interface OrdersPageProps {
  params: Promise<{ locale: string }>;
}

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login?next=/${locale}/account/orders`);
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id, created_at, status, total")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

  return (
    <main className="px-5 py-12 max-w-[900px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[22px] font-normal">{t("orders")}</h1>
        <Link href={`/${locale}/account`} className="text-[12px] text-gray-500 hover:text-black transition-colors">
          ← {locale === "mn" ? "Буцах" : "Back"}
        </Link>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[15px] text-gray-400 mb-6">{t("noOrders")}</p>
          <Link
            href={`/${locale}/store`}
            className="inline-block border border-black rounded-full px-6 py-2.5 text-[12px] tracking-wide hover:bg-black hover:text-white transition-colors"
          >
            {locale === "mn" ? "Дэлгүүрлэх" : "Shop Now"}
          </Link>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="grid grid-cols-4 gap-4 pb-2 text-[11px] uppercase tracking-wide text-gray-500">
            <span>{t("orderDate")}</span>
            <span>{locale === "mn" ? "Захиалгын №" : "Order #"}</span>
            <span>{t("orderStatus")}</span>
            <span className="text-right">{t("orderTotal")}</span>
          </div>
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/${locale}/account/orders/${order.id}`}
              className="grid grid-cols-4 gap-4 py-3 border-t border-gray-100 hover:bg-gray-50 transition-colors text-[13px]"
            >
              <span>{new Date(order.created_at).toLocaleDateString(locale === "mn" ? "mn-MN" : "en-US")}</span>
              <span className="font-mono text-[11px]">{order.id.slice(0, 8).toUpperCase()}</span>
              <StatusBadge status={order.status as OrderStatus} label={order.status} />
              <span className="text-right">{formatPrice(order.total, locale as "mn" | "en")}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
