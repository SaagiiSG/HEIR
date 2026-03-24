"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { OrderDetailDrawer } from "@/components/admin/OrderDetailDrawer";

export interface OrderRow {
  id: string;
  created_at: string;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  total: number;
  customer_name?: string;
  item_count?: number;
  phone?: string;
  address?: string; // pre-formatted full address
}

interface OrderTableProps {
  orders: OrderRow[];
  locale?: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Хүлээгдэж байна",
  paid: "Төлөгдсөн",
  processing: "Бэлтгэж байна",
  shipped: "Хүргэлтэд",
  delivered: "Хүргэгдсэн",
  cancelled: "Цуцлагдсан",
  refunded: "Буцаасан",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button
      onClick={handleCopy}
      title="Copy address"
      className="ml-1.5 shrink-0 text-gray-300 hover:text-black transition-colors"
    >
      {copied ? (
        <svg className="w-3.5 h-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

export function OrderTable({ orders, locale = "mn" }: OrderTableProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  if (orders.length === 0) {
    return (
      <p className="text-[13px] text-gray-400 py-8 text-center">
        {locale === "mn" ? "Захиалга байхгүй" : "No orders"}
      </p>
    );
  }

  return (
    <>
    <OrderDetailDrawer
      orderId={selectedOrderId}
      locale={locale}
      onClose={() => setSelectedOrderId(null)}
    />
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 font-normal text-[11px] uppercase tracking-wide text-gray-500 pr-4">
              {locale === "mn" ? "Захиалга №" : "Order #"}
            </th>
            <th className="text-left py-3 font-normal text-[11px] uppercase tracking-wide text-gray-500 pr-4">
              {locale === "mn" ? "Огноо" : "Date"}
            </th>
            <th className="text-left py-3 font-normal text-[11px] uppercase tracking-wide text-gray-500 pr-4">
              {locale === "mn" ? "Хэрэглэгч" : "Customer"}
            </th>
            <th className="text-left py-3 font-normal text-[11px] uppercase tracking-wide text-gray-500 pr-4">
              {locale === "mn" ? "Хаяг" : "Address"}
            </th>
            <th className="text-left py-3 font-normal text-[11px] uppercase tracking-wide text-gray-500 pr-4">
              {locale === "mn" ? "Төлөв" : "Status"}
            </th>
            <th className="text-right py-3 font-normal text-[11px] uppercase tracking-wide text-gray-500">
              {locale === "mn" ? "Нийт" : "Total"}
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              onClick={() => setSelectedOrderId(order.id)}
              className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <td className="py-3 pr-4">
                <span className="font-mono text-[11px]">
                  {order.id.slice(0, 8).toUpperCase()}
                </span>
              </td>
              <td className="py-3 pr-4 text-gray-500">
                {new Date(order.created_at).toLocaleDateString(locale === "mn" ? "mn-MN" : "en-US")}
              </td>
              <td className="py-3 pr-4">
                <div>{order.customer_name ?? "—"}</div>
                {order.phone && (
                  <div className="text-[10px] text-gray-400 mt-0.5">{order.phone}</div>
                )}
              </td>
              <td className="py-3 pr-4 max-w-[220px]">
                {order.address ? (
                  <div className="flex items-start gap-1">
                    <span className="text-[11px] leading-snug text-gray-700 break-words">{order.address}</span>
                    <CopyButton text={order.address} />
                  </div>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
              <td className="py-3 pr-4">
                <StatusBadge
                  status={order.status}
                  label={STATUS_LABELS[order.status] ?? order.status}
                />
              </td>
              <td className="py-3 text-right">
                {formatPrice(order.total, locale as "mn" | "en")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}
