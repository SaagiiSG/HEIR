"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { VariantDraft } from "./VariantManager";

const ALL_SHOE_SIZES = ["38", "39", "40", "41", "42", "43", "44", "45", "46"];

interface ShoeColor {
  color_name_mn: string;
  color_name_en: string;
  color_hex: string;
  stock: number; // stock applied to each size variant for this color
}

interface ShoeVariantManagerProps {
  // Pass existing variants so we can hydrate when editing
  initialVariants?: VariantDraft[];
  onChange: (variants: VariantDraft[]) => void;
}

function emptyColor(): ShoeColor {
  return { color_name_mn: "", color_name_en: "", color_hex: "#000000", stock: 0 };
}

/** Derive (selectedSizes, colors) from a flat VariantDraft[] */
function hydrateFromVariants(variants: VariantDraft[]): {
  selectedSizes: string[];
  colors: ShoeColor[];
} {
  if (!variants.length) return { selectedSizes: [], colors: [emptyColor()] };

  const sizes = Array.from(new Set(variants.map((v) => v.size))).filter((s) =>
    ALL_SHOE_SIZES.includes(s)
  );

  // Deduplicate colors by hex
  const seen = new Set<string>();
  const colors: ShoeColor[] = [];
  for (const v of variants) {
    if (!seen.has(v.color_hex)) {
      seen.add(v.color_hex);
      colors.push({
        color_name_mn: v.color_name_mn,
        color_name_en: v.color_name_en,
        color_hex: v.color_hex,
        stock: v.stock,
      });
    }
  }

  return { selectedSizes: sizes, colors: colors.length ? colors : [emptyColor()] };
}

/** Expand (selectedSizes, colors) → flat VariantDraft[] */
function buildVariants(selectedSizes: string[], colors: ShoeColor[]): VariantDraft[] {
  const out: VariantDraft[] = [];
  for (const color of colors) {
    for (const size of selectedSizes) {
      out.push({
        size,
        color_name_mn: color.color_name_mn,
        color_name_en: color.color_name_en,
        color_hex: color.color_hex,
        sku: "",
        stock: color.stock,
      });
    }
  }
  return out;
}

export function ShoeVariantManager({ initialVariants, onChange }: ShoeVariantManagerProps) {
  const hydrated = hydrateFromVariants(initialVariants ?? []);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(hydrated.selectedSizes);
  const [colors, setColors] = useState<ShoeColor[]>(hydrated.colors);

  // Propagate changes up whenever state changes
  useEffect(() => {
    onChange(buildVariants(selectedSizes, colors));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSizes, colors]);

  function toggleSize(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }

  function addColor() {
    setColors((prev) => [...prev, emptyColor()]);
  }

  function removeColor(index: number) {
    setColors((prev) => prev.filter((_, i) => i !== index));
  }

  function updateColor(index: number, patch: Partial<ShoeColor>) {
    setColors((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  const totalVariants = selectedSizes.length * colors.filter((c) => c.color_name_en).length;

  return (
    <div className="space-y-6">
      {/* Size tags */}
      <div>
        <p className="text-[11px] uppercase tracking-wide mb-3">
          Available Sizes
          {selectedSizes.length > 0 && (
            <span className="ml-2 text-gray-400 normal-case tracking-normal">
              ({selectedSizes.sort((a, b) => Number(a) - Number(b)).join(", ")} selected)
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {ALL_SHOE_SIZES.map((size) => {
            const active = selectedSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`px-3 py-1.5 text-[12px] border transition-colors ${
                  active
                    ? "border-black bg-black text-white"
                    : "border-gray-300 text-gray-500 hover:border-black hover:text-black"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
        {selectedSizes.length === 0 && (
          <p className="text-[11px] text-gray-400 mt-2">Select at least one size.</p>
        )}
      </div>

      {/* Color rows */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] uppercase tracking-wide">
            Colors ({colors.length})
            {totalVariants > 0 && (
              <span className="ml-2 text-gray-400 normal-case tracking-normal">
                → {totalVariants} variant{totalVariants !== 1 ? "s" : ""} total
              </span>
            )}
          </p>
          <Button variant="outline" size="sm" onClick={addColor} type="button">
            <Plus className="w-3 h-3 mr-1.5" strokeWidth={1.5} />
            Add Color
          </Button>
        </div>

        {colors.length === 0 && (
          <p className="text-[12px] text-gray-400 py-4 text-center border border-dashed border-gray-200">
            No colors yet. Add at least one.
          </p>
        )}

        <div className="space-y-3">
          {colors.map((c, i) => (
            <div key={i} className="border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-gray-500">Color {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeColor(i)}
                  className="hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {/* Color picker */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] uppercase tracking-wide">Hex</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={c.color_hex}
                      onChange={(e) => updateColor(i, { color_hex: e.target.value })}
                      className="w-10 h-10 border border-gray-300 cursor-pointer p-0.5 shrink-0"
                    />
                    <input
                      type="text"
                      value={c.color_hex}
                      onChange={(e) => updateColor(i, { color_hex: e.target.value })}
                      className="flex-1 border border-gray-300 px-2 py-2 text-[11px] font-mono outline-none focus:border-black"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <Input
                  label="Color (MN)"
                  value={c.color_name_mn}
                  onChange={(e) => updateColor(i, { color_name_mn: e.target.value })}
                  placeholder="Хар"
                />
                <Input
                  label="Color (EN)"
                  value={c.color_name_en}
                  onChange={(e) => updateColor(i, { color_name_en: e.target.value })}
                  placeholder="Black"
                />
                <Input
                  label="Stock / size"
                  type="number"
                  min="0"
                  value={c.stock.toString()}
                  onChange={(e) => updateColor(i, { stock: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
