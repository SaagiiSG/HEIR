"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { InventoryTable, type InventoryRow } from "@/components/admin/InventoryTable";
import { updateStock } from "@/lib/actions/inventory";

interface InventoryPageClientProps {
  rows: InventoryRow[];
  locale: string;
}

export function InventoryPageClient({ rows, locale }: InventoryPageClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const lowStockCount = rows.filter((r) => r.quantity <= r.low_stock_threshold && r.quantity > 0).length;
  const outOfStockCount = rows.filter((r) => r.quantity === 0).length;

  async function handleUpdateStock(variantId: string, qty: number) {
    const result = await updateStock(variantId, qty);
    if (result.error) {
      toast(result.error, "error");
    } else {
      toast(locale === "mn" ? "Тоо шинэчлэгдлээ" : "Stock updated", "success");
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-normal">
          {locale === "mn" ? "Тооллого" : "Inventory"} ({rows.length})
        </h1>
        <div className="flex gap-4 text-[12px]">
          {outOfStockCount > 0 && (
            <span className="text-red-500">
              {outOfStockCount} {locale === "mn" ? "дууссан" : "out of stock"}
            </span>
          )}
          {lowStockCount > 0 && (
            <span className="text-yellow-600">
              {lowStockCount} {locale === "mn" ? "бага үлдэгдэл" : "low stock"}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-100 p-6">
        <InventoryTable rows={rows} locale={locale} onUpdateStock={handleUpdateStock} />
      </div>
    </div>
  );
}
