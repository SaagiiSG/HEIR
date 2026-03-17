"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateVariantStock } from "@/lib/actions/inventory";
import { Spinner } from "@/components/ui/Spinner";

interface Variant {
  id: string;
  size: string;
  color: string;
  stock: number;
}

interface RestockDialogProps {
  productId: string;
  productName: string;
  locale: string;
}

export function RestockDialog({ productId, productName, locale }: RestockDialogProps) {
  const isMn = locale === "mn";
  const [open, setOpen] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [stocks, setStocks] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function openDialog() {
    setOpen(true);
    setLoading(true);
    setSaved(false);
    const supabase = createClient();
    const { data } = await supabase
      .from("product_variants")
      .select("id, size, color, stock")
      .eq("product_id", productId)
      .order("size");
    const rows = (data ?? []) as Variant[];
    setVariants(rows);
    setStocks(Object.fromEntries(rows.map((v) => [v.id, v.stock])));
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    await updateVariantStock(
      Object.entries(stocks).map(([id, stock]) => ({ id, stock }))
    );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setOpen(false), 800);
  }

  return (
    <>
      <button
        onClick={openDialog}
        className="text-[11px] text-blue-600 hover:underline ml-3"
      >
        {isMn ? "Нөөц" : "Restock"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="relative bg-white w-full max-w-sm mx-4 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="text-[13px] font-medium">{isMn ? "Нөөц нэмэх" : "Restock"}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{productName}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-black text-[18px] leading-none"
              >
                ×
              </button>
            </div>

            <div className="px-5 py-4">
              {loading ? (
                <div className="flex justify-center py-6">
                  <Spinner size="sm" />
                </div>
              ) : variants.length === 0 ? (
                <p className="text-[12px] text-gray-400 text-center py-6">
                  {isMn ? "Вариант байхгүй" : "No variants found"}
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_1fr_80px] gap-2 text-[10px] uppercase tracking-wide text-gray-400 px-1 mb-1">
                    <span>{isMn ? "Хэмжээ" : "Size"}</span>
                    <span>{isMn ? "Өнгө" : "Color"}</span>
                    <span className="text-right">{isMn ? "Нөөц" : "Stock"}</span>
                  </div>
                  {variants.map((v) => (
                    <div key={v.id} className="grid grid-cols-[1fr_1fr_80px] gap-2 items-center">
                      <span className="text-[12px]">{v.size}</span>
                      <span className="text-[12px] text-gray-500 truncate">{v.color}</span>
                      <input
                        type="number"
                        min={0}
                        value={stocks[v.id] ?? 0}
                        onChange={(e) =>
                          setStocks((prev) => ({ ...prev, [v.id]: Math.max(0, parseInt(e.target.value) || 0) }))
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-[12px] text-right outline-none focus:border-black"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-[12px] border border-gray-200 hover:border-gray-400 transition-colors"
              >
                {isMn ? "Болих" : "Cancel"}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || saved || loading}
                className="px-4 py-2 text-[12px] bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-60 min-w-[80px]"
              >
                {saving ? <Spinner size="sm" /> : saved ? (isMn ? "Хадгалсан" : "Saved!") : (isMn ? "Хадгалах" : "Save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
