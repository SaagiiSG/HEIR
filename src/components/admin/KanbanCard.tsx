"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import type { OrderRow } from "@/components/admin/OrderTable";

interface KanbanCardProps {
  order: OrderRow;
  locale: string;
  onDragStart: (e: React.DragEvent, orderId: string) => void;
  isDragging: boolean;
}

export function KanbanCard({ order, locale, onDragStart, isDragging }: KanbanCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, order.id)}
      className={cn(
        "bg-white border border-gray-200 p-3 rounded select-none",
        "cursor-grab active:cursor-grabbing transition-opacity",
        isDragging ? "opacity-40" : "opacity-100 hover:border-gray-400"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link
          href={`/${locale}/admin/orders/${order.id}`}
          className="font-mono text-[11px] hover:underline text-black"
          onClick={(e) => e.stopPropagation()}
        >
          {order.id.slice(0, 8).toUpperCase()}
        </Link>
        <span className="text-[11px] text-gray-400 shrink-0">
          {new Date(order.created_at).toLocaleDateString(
            locale === "mn" ? "mn-MN" : "en-US",
            { month: "short", day: "numeric" }
          )}
        </span>
      </div>
      <div className="text-[12px] text-gray-700 truncate">
        {order.customer_name ?? "—"}
      </div>
      <div className="text-[12px] font-medium mt-1">
        {formatPrice(order.total, locale as "mn" | "en")}
      </div>
    </div>
  );
}
