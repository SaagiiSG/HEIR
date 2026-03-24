"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater";
import { CheckBylPaymentButton } from "@/components/admin/CheckBylPaymentButton";

type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

interface OrderItem {
  id: string;
  product_name_en: string;
  product_name_mn: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  image: string | null;
}

interface OrderDetail {
  id: string;
  created_at: string;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  total: number;
  shipping_first_name: string;
  shipping_last_name: string;
  shipping_phone: string;
  shipping_address1: string;
  shipping_address2: string | null;
  shipping_city: string;
  shipping_district: string;
  shipping_postal_code: string | null;
  notes: string | null;
  user_id: string | null;
  order_items: OrderItem[];
}

interface OrderDetailDrawerProps {
  orderId: string | null;
  locale: string;
  onClose: () => void;
}

export function OrderDetailDrawer({ orderId, locale, onClose }: OrderDetailDrawerProps) {
  const isMn = locale === "mn";
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orderId) { setOrder(null); return; }
    setLoading(true);
    fetch(`/api/admin/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => setOrder(data))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isOpen = !!orderId;

  if (!isOpen) return null;

  const STATUS_LABELS: Record<string, string> = {
    pending: "Хүлээгдэж байна", paid: "Төлөгдсөн", processing: "Бэлтгэж байна",
    shipped: "Хүргэлтэд", delivered: "Хүргэгдсэн", cancelled: "Цуцлагдсан", refunded: "Буцаасан",
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-[520px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            {order && (
              <>
                <p className="font-mono text-[13px] font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {new Date(order.created_at).toLocaleString(isMn ? "mn-MN" : "en-US")}
                </p>
              </>
            )}
          </div>
          <button onClick={onClose} className="hover:opacity-60 transition-opacity p-1">
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {loading && (
            <div className="flex items-center justify-center h-40 text-[12px] text-gray-400">
              {isMn ? "Уншиж байна..." : "Loading..."}
            </div>
          )}

          {!loading && order && (
            <>
              {/* Status */}
              <div className="flex items-center gap-3">
                <StatusBadge status={order.status} label={STATUS_LABELS[order.status] ?? order.status} />
                {!order.user_id && (
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                    {isMn ? "Зочин" : "Guest"}
                  </span>
                )}
              </div>

              {/* Status updater */}
              <OrderStatusUpdater orderId={order.id} currentStatus={order.status} locale={locale} />

              {/* BYL sync button for pending orders */}
              {order.status === "pending" && (
                <CheckBylPaymentButton orderId={order.id} isMn={isMn} />
              )}

              {/* Items */}
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-3">
                  {isMn ? "Захиалсан бараа" : "Items"}
                </p>
                <div className="space-y-3">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-16 shrink-0 bg-gray-100 overflow-hidden rounded-sm">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={isMn ? item.product_name_mn : item.product_name_en}
                            width={48}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] leading-snug">
                          {isMn ? item.product_name_mn : item.product_name_en}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {item.size}{item.color ? ` / ${item.color}` : ""} · x{item.quantity}
                        </p>
                      </div>
                      <p className="text-[12px] shrink-0">
                        {formatPrice(item.price * item.quantity, locale as "mn" | "en")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 space-y-1.5 text-[12px]">
                <div className="flex justify-between text-gray-500">
                  <span>{isMn ? "Дэд нийт" : "Subtotal"}</span>
                  <span>{formatPrice(order.subtotal, locale as "mn" | "en")}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>{isMn ? "Хүргэлт" : "Shipping"}</span>
                  <span>{order.shipping === 0 ? (isMn ? "Үнэгүй" : "Free") : formatPrice(order.shipping, locale as "mn" | "en")}</span>
                </div>
                <div className="flex justify-between font-medium text-[13px] pt-1 border-t border-gray-100">
                  <span>{isMn ? "Нийт" : "Total"}</span>
                  <span>{formatPrice(order.total, locale as "mn" | "en")}</span>
                </div>
              </div>

              {/* Customer */}
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-2">
                  {isMn ? "Хэрэглэгч" : "Customer"}
                </p>
                <p className="text-[12px] font-medium">
                  {[order.shipping_first_name, order.shipping_last_name].filter(Boolean).join(" ") || "—"}
                </p>
                {order.shipping_phone && (
                  <p className="text-[12px] text-gray-500 mt-0.5">{order.shipping_phone}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-2">
                  {isMn ? "Хүргэх хаяг" : "Shipping Address"}
                </p>
                <div className="text-[12px] text-gray-700 leading-[1.8]">
                  <p>{order.shipping_address1}</p>
                  {order.shipping_address2 && <p>{order.shipping_address2}</p>}
                  <p className="text-gray-500">
                    {[order.shipping_district, order.shipping_city].filter(Boolean).join(", ")}
                    {order.shipping_postal_code ? `, ${order.shipping_postal_code}` : ""}
                  </p>
                </div>
                {order.notes && (
                  <p className="text-[11px] text-gray-400 mt-2">{isMn ? "Тэмдэглэл: " : "Note: "}{order.notes}</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
