"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { KanbanCard } from "@/components/admin/KanbanCard";
import { updateOrderStatus, type KanbanStatus } from "@/lib/actions/orders";
import { useToast } from "@/components/ui/Toast";
import type { OrderRow } from "@/components/admin/OrderTable";

const COLUMNS: { status: KanbanStatus; labelMn: string; labelEn: string }[] = [
  { status: "pending",    labelMn: "Хүлээгдэж байна",  labelEn: "Orders" },
  { status: "paid",       labelMn: "Төлөгдсөн",         labelEn: "Payment Checked" },
  { status: "processing", labelMn: "Бэлтгэж байна",     labelEn: "Prepared" },
  { status: "shipped",    labelMn: "Хүргэлтэд",         labelEn: "Handed to Delivery" },
  { status: "delivered",  labelMn: "Хүргэгдсэн",        labelEn: "Delivered" },
];

interface OrdersKanbanProps {
  orders: OrderRow[];
  locale: string;
}

export function OrdersKanban({ orders: initialOrders, locale }: OrdersKanbanProps) {
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<KanbanStatus | null>(null);
  const { toast } = useToast();

  const handleDragStart = useCallback((e: React.DragEvent, orderId: string) => {
    setDraggingId(orderId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, status: KanbanStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(status);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if leaving the column entirely (not entering a child)
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setDragOverColumn(null);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, newStatus: KanbanStatus) => {
      e.preventDefault();
      setDragOverColumn(null);

      if (!draggingId) return;

      const order = orders.find((o) => o.id === draggingId);
      if (!order || order.status === newStatus) {
        setDraggingId(null);
        return;
      }

      const previousStatus = order.status;

      // Optimistic update
      setOrders((prev) =>
        prev.map((o) =>
          o.id === draggingId ? { ...o, status: newStatus } : o
        )
      );
      setDraggingId(null);

      const { error } = await updateOrderStatus(draggingId, newStatus);

      if (error) {
        // Revert
        setOrders((prev) =>
          prev.map((o) =>
            o.id === draggingId ? { ...o, status: previousStatus } : o
          )
        );
        toast(`Алдаа: ${error}`, "error");
      }
    },
    [draggingId, orders, toast]
  );

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverColumn(null);
  }, []);

  return (
    <div className="-mx-8 px-8 overflow-x-auto pb-8">
      <div className="flex gap-4 min-w-max">
        {COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.status);
          const isOver = dragOverColumn === col.status;

          return (
            <div
              key={col.status}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.status)}
              className={cn(
                "w-60 flex flex-col rounded border transition-colors",
                isOver
                  ? "border-black bg-gray-50"
                  : "border-gray-200 bg-gray-50"
              )}
            >
              {/* Column header */}
              <div className="px-3 py-2.5 border-b border-gray-200 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wide font-medium text-gray-700">
                  {locale === "mn" ? col.labelMn : col.labelEn}
                </span>
                <span className="text-[11px] text-gray-400 tabular-nums">
                  {colOrders.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 p-2 min-h-[200px]">
                {colOrders.map((order) => (
                  <KanbanCard
                    key={order.id}
                    order={order}
                    locale={locale}
                    onDragStart={handleDragStart}
                    isDragging={draggingId === order.id}
                  />
                ))}
                {colOrders.length === 0 && (
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-[11px] text-gray-300">
                      {locale === "mn" ? "Хоосон" : "Empty"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
