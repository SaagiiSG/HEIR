"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { VariantImageUpload } from "@/components/admin/VariantImageUpload";
import type { VariantDraft } from "./VariantManager";

interface AccessoryColor {
  color_name_mn: string;
  color_name_en: string;
  color_hex: string;
  sizes: string[];
  stock: number;
  images: string[];
}

interface AccessoryVariantManagerProps {
  initialVariants?: VariantDraft[];
  onChange: (variants: VariantDraft[]) => void;
}

function emptyColor(): AccessoryColor {
  return { color_name_mn: "", color_name_en: "", color_hex: "#000000", sizes: [], stock: 0, images: [] };
}

function hydrateFromVariants(variants: VariantDraft[]): AccessoryColor[] {
  if (!variants.length) return [emptyColor()];

  const map = new Map<string, AccessoryColor>();
  for (const v of variants) {
    if (!map.has(v.color_hex)) {
      map.set(v.color_hex, {
        color_name_mn: v.color_name_mn,
        color_name_en: v.color_name_en,
        color_hex: v.color_hex,
        sizes: [],
        stock: v.stock,
        images: v.images ?? [],
      });
    }
    if (v.size) map.get(v.color_hex)!.sizes.push(v.size);
  }

  return map.size ? Array.from(map.values()) : [emptyColor()];
}

function buildVariants(colors: AccessoryColor[]): VariantDraft[] {
  const out: VariantDraft[] = [];
  for (const color of colors) {
    for (const size of color.sizes) {
      out.push({
        size,
        color_name_mn: color.color_name_mn,
        color_name_en: color.color_name_en,
        color_hex: color.color_hex,
        sku: "",
        stock: color.stock,
        images: color.images,
      });
    }
    // If no sizes added yet, emit a placeholder so the color isn't lost
    if (color.sizes.length === 0) {
      out.push({
        size: "",
        color_name_mn: color.color_name_mn,
        color_name_en: color.color_name_en,
        color_hex: color.color_hex,
        sku: "",
        stock: color.stock,
        images: color.images,
      });
    }
  }
  return out;
}

export function AccessoryVariantManager({ initialVariants, onChange }: AccessoryVariantManagerProps) {
  const [colors, setColors] = useState<AccessoryColor[]>(() =>
    hydrateFromVariants(initialVariants ?? [])
  );

  useEffect(() => {
    onChange(buildVariants(colors));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors]);

  function addColor() {
    setColors((prev) => [...prev, emptyColor()]);
  }

  function removeColor(index: number) {
    setColors((prev) => prev.filter((_, i) => i !== index));
  }

  function updateColor(index: number, patch: Partial<AccessoryColor>) {
    setColors((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  function addSize(colorIndex: number, size: string) {
    const trimmed = size.trim();
    if (!trimmed) return;
    setColors((prev) =>
      prev.map((c, i) => {
        if (i !== colorIndex) return c;
        if (c.sizes.includes(trimmed)) return c; // no duplicates
        return { ...c, sizes: [...c.sizes, trimmed] };
      })
    );
  }

  function removeSize(colorIndex: number, size: string) {
    setColors((prev) =>
      prev.map((c, i) =>
        i !== colorIndex ? c : { ...c, sizes: c.sizes.filter((s) => s !== size) }
      )
    );
  }

  const totalVariants = colors.reduce((sum, c) => sum + Math.max(c.sizes.length, 1), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] uppercase tracking-wide">
          Colors ({colors.length})
          {totalVariants > 0 && (
            <span className="ml-2 text-gray-400 normal-case tracking-normal">
              → {colors.reduce((s, c) => s + c.sizes.length, 0)} variant{colors.reduce((s, c) => s + c.sizes.length, 0) !== 1 ? "s" : ""} total
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
          <div key={i} className="border border-gray-100 p-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <VariantImageUpload
                images={c.images}
                onChange={(urls) => updateColor(i, { images: urls })}
              />
              <button
                type="button"
                onClick={() => removeColor(i)}
                className="hover:text-red-500 transition-colors mt-0.5 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Color fields */}
            <div className="grid grid-cols-4 gap-3">
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

            {/* Free-form size tag input */}
            <SizeTagInput
              sizes={c.sizes}
              onAdd={(size) => addSize(i, size)}
              onRemove={(size) => removeSize(i, size)}
            />

          </div>
        ))}
      </div>
    </div>
  );
}

function SizeTagInput({
  sizes,
  onAdd,
  onRemove,
}: {
  sizes: string[];
  onAdd: (size: string) => void;
  onRemove: (size: string) => void;
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (input.trim()) {
        onAdd(input.trim());
        setInput("");
      }
    } else if (e.key === "Backspace" && input === "" && sizes.length > 0) {
      onRemove(sizes[sizes.length - 1]);
    }
  }

  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide mb-2">Sizes</p>
      <div
        className="flex flex-wrap gap-1.5 items-center min-h-[40px] border border-gray-300 px-2 py-1.5 focus-within:border-black transition-colors cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {sizes.map((size) => (
          <span
            key={size}
            className="inline-flex items-center gap-1 bg-black text-white text-[11px] px-2 py-0.5"
          >
            {size}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(size); }}
              className="hover:opacity-60 transition-opacity"
            >
              <X className="w-2.5 h-2.5" strokeWidth={2.5} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={sizes.length === 0 ? "Type a size and press Enter…" : ""}
          className="flex-1 min-w-[120px] outline-none text-[12px] bg-transparent py-0.5"
        />
      </div>
      {sizes.length === 0 && (
        <p className="text-[11px] text-gray-400 mt-1">Add at least one size.</p>
      )}
    </div>
  );
}
