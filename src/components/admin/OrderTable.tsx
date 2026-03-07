"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

export interface OrderRow {
  id: string;
  created_at: string;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  total: number;
  customer_name?: string;
  item_count?: number;
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

export function OrderTable({ orders, locale = "mn" }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <p className="text-[13px] text-gray-400 py-8 text-center">
        {locale === "mn" ? "Захиалга байхгүй" : "No orders"}
      </p>
    );
  }

  return (
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
              {locale === "mn" ? "Төлөв" : "Status"}
            </th>
            <th className="text-right py-3 font-normal text-[11px] uppercase tracking-wide text-gray-500">
              {locale === "mn" ? "Нийт" : "Total"}
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-3 pr-4">
                <Link
                  href={`/${locale}/admin/orders/${order.id}`}
                  className="font-mono text-[11px] hover:underline"
                >
                  {order.id.slice(0, 8).toUpperCase()}
                </Link>
              </td>
              <td className="py-3 pr-4 text-gray-500">
                {new Date(order.created_at).toLocaleDateString(locale === "mn" ? "mn-MN" : "en-US")}
              </td>
              <td className="py-3 pr-4">
                {order.customer_name ?? "—"}
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
  );
}
