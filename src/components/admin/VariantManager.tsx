"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface VariantDraft {
  id?: string; // undefined = new
  size: string;
  color_name_mn: string;
  color_name_en: string;
  color_hex: string;
  sku: string;
  stock: number;
}

interface VariantManagerProps {
  variants: VariantDraft[];
  onChange: (variants: VariantDraft[]) => void;
}

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

function emptyVariant(): VariantDraft {
  return {
    size: "M",
    color_name_mn: "",
    color_name_en: "",
    color_hex: "#000000",
    sku: "",
    stock: 0,
  };
}

export function VariantManager({ variants, onChange }: VariantManagerProps) {
  function addVariant() {
    onChange([...variants, emptyVariant()]);
  }

  function removeVariant(index: number) {
    onChange(variants.filter((_, i) => i !== index));
  }

  function updateVariant(index: number, patch: Partial<VariantDraft>) {
    const updated = variants.map((v, i) => (i === index ? { ...v, ...patch } : v));
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] uppercase tracking-wide">
          Variants ({variants.length})
        </p>
        <Button variant="outline" size="sm" onClick={addVariant} type="button">
          <Plus className="w-3 h-3 mr-1.5" strokeWidth={1.5} />
          Add Variant
        </Button>
      </div>

      {variants.length === 0 && (
        <p className="text-[12px] text-gray-400 py-4 text-center border border-dashed border-gray-200">
          No variants yet. Add at least one.
        </p>
      )}

      {variants.map((v, i) => (
        <div key={i} className="border border-gray-100 p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-gray-500">Variant {i + 1}</span>
            <button
              type="button"
              onClick={() => removeVariant(i)}
              className="hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] uppercase tracking-wide">Size</label>
              <select
                value={v.size}
                onChange={(e) => updateVariant(i, { size: e.target.value })}
                className="border border-gray-300 px-3 py-2.5 text-[13px] outline-none focus:border-black appearance-none bg-white"
              >
                {SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <Input
              label="Color (MN)"
              value={v.color_name_mn}
              onChange={(e) => updateVariant(i, { color_name_mn: e.target.value })}
              placeholder="Хар"
            />
            <Input
              label="Color (EN)"
              value={v.color_name_en}
              onChange={(e) => updateVariant(i, { color_name_en: e.target.value })}
              placeholder="Black"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] uppercase tracking-wide">Color Hex</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={v.color_hex}
                  onChange={(e) => updateVariant(i, { color_hex: e.target.value })}
                  className="w-10 h-10 border border-gray-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={v.color_hex}
                  onChange={(e) => updateVariant(i, { color_hex: e.target.value })}
                  className="flex-1 border border-gray-300 px-3 py-2 text-[12px] font-mono outline-none focus:border-black"
                  placeholder="#000000"
                />
              </div>
            </div>
            <Input
              label="SKU"
              value={v.sku}
              onChange={(e) => updateVariant(i, { sku: e.target.value })}
              placeholder="HEIR-BLZ-M-BLK"
            />
            <Input
              label="Stock"
              type="number"
              min="0"
              value={v.stock.toString()}
              onChange={(e) => updateVariant(i, { stock: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
