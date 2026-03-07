import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { formatPrice } from "@/lib/utils";
import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater";

interface AdminOrderDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

const STATUS_LABELS_MN: Record<string, string> = {
  pending: "Хүлээгдэж байна",
  paid: "Төлөгдсөн",
  processing: "Бэлтгэж байна",
  shipped: "Хүргэлтэд гарсан",
  delivered: "Хүргэгдсэн",
  cancelled: "Цуцлагдсан",
  refunded: "Буцаасан",
};

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { locale, id } = await params;
  const isMn = locale === "mn";

  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select(`
      id, created_at, status, subtotal, shipping, total,
      shipping_first_name, shipping_last_name,
      shipping_phone, shipping_email,
      shipping_address1, shipping_address2,
      shipping_city, shipping_district,
      notes, user_id,
      order_items (
        id, quantity, price,
        product_name_en, product_name_mn,
        size, color
      )
    `)
    .eq("id", id)
    .single();

  if (!order) notFound();

  // Fetch customer email via admin auth (if user_id exists)
  let customerEmail: string | null = null;
  if (order.user_id) {
    const { data: authUser } = await supabase.auth.admin.getUserById(order.user_id);
    customerEmail = authUser?.user?.email ?? null;
  }

  const items = order.order_items ?? [];
  const customerName = [order.shipping_first_name, order.shipping_last_name]
    .filter(Boolean)
    .join(" ") || "—";

  return (
    <div className="max-w-[760px] space-y-6">
      <div className="flex items-center gap-3">
        <AdminBackLink href={`/${locale}/admin/orders`} locale={locale} />
        <h1 className="text-[20px] font-normal">
          {isMn ? "Захиалга" : "Order"}{" "}
          <span className="font-mono text-[16px]">#{id.slice(0, 8).toUpperCase()}</span>
        </h1>
      </div>

      {/* Status updater (client component) */}
      <OrderStatusUpdater
        orderId={id}
        currentStatus={order.status}
        locale={locale}
      />

      {/* Order items */}
      <div className="bg-white border border-gray-100 p-6">
        <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-4">
          {isMn ? "Захиалсан бараа" : "Items"}
        </p>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-normal text-[11px] text-gray-400 pr-4">
                {isMn ? "Бараа" : "Product"}
              </th>
              <th className="text-left py-2 font-normal text-[11px] text-gray-400 pr-4">
                {isMn ? "Хэмжээ / Өнгө" : "Size / Color"}
              </th>
              <th className="text-center py-2 font-normal text-[11px] text-gray-400 pr-4">
                {isMn ? "Тоо" : "Qty"}
              </th>
              <th className="text-right py-2 font-normal text-[11px] text-gray-400">
                {isMn ? "Үнэ" : "Price"}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-50">
                <td className="py-3 pr-4">
                  {isMn ? item.product_name_mn : item.product_name_en}
                </td>
                <td className="py-3 pr-4 text-gray-500">
                  {item.size} / {item.color}
                </td>
                <td className="py-3 pr-4 text-center">{item.quantity}</td>
                <td className="py-3 text-right">
                  {formatPrice(item.price * item.quantity, locale as "mn" | "en")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-1 text-[12px]">
          <div className="flex justify-between text-gray-500">
            <span>{isMn ? "Барааны нийт" : "Subtotal"}</span>
            <span>{formatPrice(order.subtotal, locale as "mn" | "en")}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>{isMn ? "Хүргэлт" : "Shipping"}</span>
            <span>{formatPrice(order.shipping ?? 0, locale as "mn" | "en")}</span>
          </div>
          <div className="flex justify-between font-medium text-[13px] pt-1">
            <span>{isMn ? "Нийт дүн" : "Total"}</span>
            <span>{formatPrice(order.total, locale as "mn" | "en")}</span>
          </div>
        </div>
      </div>

      {/* Customer + shipping */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 p-6">
          <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-4">
            {isMn ? "Хэрэглэгч" : "Customer"}
          </p>
          <div className="space-y-1 text-[12px]">
            <p className="font-medium">{customerName}</p>
            {customerEmail && <p className="text-gray-500">{customerEmail}</p>}
            {order.shipping_phone && <p className="text-gray-500">{order.shipping_phone}</p>}
            <p className="text-[11px] text-gray-400 pt-1">
              {new Date(order.created_at).toLocaleString(isMn ? "mn-MN" : "en-US")}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-6">
          <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-4">
            {isMn ? "Хүргэх хаяг" : "Shipping Address"}
          </p>
          <div className="space-y-0.5 text-[12px]">
            <p>{order.shipping_address1}</p>
            {order.shipping_address2 && <p>{order.shipping_address2}</p>}
            <p className="text-gray-500">
              {[order.shipping_district, order.shipping_city].filter(Boolean).join(", ")}
            </p>
            {order.notes && (
              <p className="text-gray-400 pt-2 text-[11px]">
                {isMn ? "Тэмдэглэл: " : "Note: "}{order.notes}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
