"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export interface InventoryRow {
  variant_id: string;
  sku?: string;
  product_name: string;
  size: string;
  color: string;
  quantity: number;
  low_stock_threshold: number;
}

interface InventoryTableProps {
  rows: InventoryRow[];
  locale?: string;
  onUpdateStock?: (variantId: string, newQty: number) => Promise<void>;
}

export function InventoryTable({ rows, locale = "mn", onUpdateStock }: InventoryTableProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  async function saveEdit(variantId: string) {
    const qty = parseInt(editValue, 10);
    if (!isNaN(qty) && qty >= 0 && onUpdateStock) {
      await onUpdateStock(variantId, qty);
    }
    setEditing(null);
    setEditValue("");
  }

  if (rows.length === 0) {
    return (
      <p className="text-[13px] text-gray-400 py-8 text-center">
        {locale === "mn" ? "Тооллого байхгүй" : "No inventory"}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 font-normal text-[11px] uppercase tracking-wide text-gray-500 pr-4">SKU</th>
            <th className="text-left py-3 font-normal text-[11px] uppercase tracking-wide text-gray-500 pr-4">
              {locale === "mn" ? "Бараа" : "Product"}
            </th>
            <th className="text-left py-3 font-normal text-[11px] uppercase tracking-wide text-gray-500 pr-4">
              {locale === "mn" ? "Хэмжээ" : "Size"}
            </th>
            <th className="text-left py-3 font-normal text-[11px] uppercase tracking-wide text-gray-500 pr-4">
              {locale === "mn" ? "Өнгө" : "Color"}
            </th>
            <th className="text-right py-3 font-normal text-[11px] uppercase tracking-wide text-gray-500">
              {locale === "mn" ? "Тоо ширхэг" : "Stock"}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isLow = row.quantity <= row.low_stock_threshold && row.quantity > 0;
            const isOut = row.quantity === 0;

            return (
              <tr key={row.variant_id} className={cn(
                "border-b border-gray-50",
                isOut && "bg-red-50",
                isLow && !isOut && "bg-yellow-50"
              )}>
                <td className="py-3 pr-4 font-mono text-[11px] text-gray-400">
                  {row.sku ?? "—"}
                </td>
                <td className="py-3 pr-4">{row.product_name}</td>
                <td className="py-3 pr-4">{row.size}</td>
                <td className="py-3 pr-4">{row.color}</td>
                <td className="py-3 text-right">
                  {editing === row.variant_id ? (
                    <div className="flex items-center justify-end gap-2">
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-16 border border-gray-300 px-2 py-1 text-[12px] text-right outline-none focus:border-black"
                        min="0"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(row.variant_id);
                          if (e.key === "Escape") setEditing(null);
                        }}
                      />
                      <button
                        onClick={() => saveEdit(row.variant_id)}
                        className="text-[11px] border border-black px-2 py-1 hover:bg-black hover:text-white transition-colors"
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      {(isLow || isOut) && (
                        <AlertTriangle
                          className={cn("w-3.5 h-3.5", isOut ? "text-red-500" : "text-yellow-500")}
                          strokeWidth={1.5}
                        />
                      )}
                      <button
                        onClick={() => {
                          setEditing(row.variant_id);
                          setEditValue(row.quantity.toString());
                        }}
                        className="hover:underline"
                      >
                        {row.quantity}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
