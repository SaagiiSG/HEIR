"use client";

import { useTranslations } from "next-intl";

interface Variant {
  id: string;
  size: string;
  color: string;
  color_hex: string;
  stock: number;
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId: string | null;
  onSelect: (variantId: string) => void;
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onSelect,
}: VariantSelectorProps) {
  const t = useTranslations("product");

  // Group variants by size and color
  const sizes = [...new Set(variants.map((v) => v.size))];
  const colors = [...new Set(variants.map((v) => v.color))].map((c) => {
    const v = variants.find((vv) => vv.color === c)!;
    return { color: c, color_hex: v.color_hex };
  });

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  function selectBySize(size: string) {
    // Keep same color if possible
    const currentColor = selectedVariant?.color;
    const match = variants.find(
      (v) => v.size === size && (!currentColor || v.color === currentColor) && v.stock > 0
    ) || variants.find((v) => v.size === size && v.stock > 0);
    if (match) onSelect(match.id);
  }

  function selectByColor(color: string) {
    // Keep same size if possible
    const currentSize = selectedVariant?.size;
    const match = variants.find(
      (v) => v.color === color && (!currentSize || v.size === currentSize) && v.stock > 0
    ) || variants.find((v) => v.color === color && v.stock > 0);
    if (match) onSelect(match.id);
  }

  return (
    <div className="space-y-5">
      {/* Color */}
      {colors.length > 1 && (
        <div>
          <p className="text-[11px] uppercase tracking-wide mb-3">
            {t("selectColor")}
            {selectedVariant && (
              <span className="normal-case ml-2 text-gray-500">— {selectedVariant.color}</span>
            )}
          </p>
          <div className="flex gap-2">
            {colors.map(({ color, color_hex }) => (
              <button
                key={color}
                title={color}
                aria-label={color}
                aria-pressed={selectedVariant?.color === color}
                onClick={() => selectByColor(color)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  selectedVariant?.color === color
                    ? "border-black scale-110"
                    : "border-gray-200 hover:border-gray-400"
                }`}
                style={{ backgroundColor: color_hex }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size */}
      <div>
        <p className="text-[11px] uppercase tracking-wide mb-3">{t("selectSize")}</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const available = variants.some(
              (v) =>
                v.size === size &&
                (!selectedVariant?.color || v.color === selectedVariant.color) &&
                v.stock > 0
            );
            const isSelected = selectedVariant?.size === size;

            return (
              <button
                key={size}
                onClick={() => selectBySize(size)}
                disabled={!available}
                aria-pressed={isSelected}
                className={`min-w-[44px] h-11 px-3 border text-[11px] transition-colors ${
                  isSelected
                    ? "border-black bg-black text-white"
                    : available
                    ? "border-gray-300 hover:border-black"
                    : "border-gray-200 text-gray-300 cursor-not-allowed line-through"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
