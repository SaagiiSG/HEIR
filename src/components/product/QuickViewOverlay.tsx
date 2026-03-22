"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import type { ProductCardData } from "./ProductCard";

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  color_hex: string | null;
  stock: number;
}

interface QuickViewOverlayProps {
  product: ProductCardData;
  locale: string;
  onClose: (e?: React.MouseEvent) => void;
}

export function QuickViewOverlay({ product, locale, onClose }: QuickViewOverlayProps) {
  const isMn = locale === "mn";
  const displayName = isMn ? product.nameMn : product.name;
  const router = useRouter();
  const { addItem, openCart } = useCart();

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("product_variants")
      .select("id, size, color, color_hex, stock")
      .eq("product_id", product.id)
      .gt("stock", 0)
      .then(({ data }) => {
        const v = data ?? [];
        setVariants(v);
        // Pre-select first color
        if (v.length > 0) {
          setSelectedColor(v[0].color);
        }
        setLoading(false);
      });
  }, [product.id]);

  // Unique colors
  const colors = variants.reduce<{ color: string; hex: string | null }[]>(
    (acc, v) => {
      if (!acc.find((c) => c.color === v.color)) {
        acc.push({ color: v.color, hex: v.color_hex });
      }
      return acc;
    },
    []
  );

  // Sizes available for selected color
  const sizesForColor = variants
    .filter((v) => v.color === selectedColor)
    .map((v) => v.size);

  // All unique sizes (for single-color products)
  const allSizes = [...new Set(variants.map((v) => v.size))];
  const sizes = colors.length > 1 ? sizesForColor : allSizes;

  const selectedVariant = variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  ) ?? (colors.length === 1 && selectedSize
    ? variants.find((v) => v.size === selectedSize)
    : null);

  function selectColor(color: string) {
    setSelectedColor(color);
    // Keep size if available in new color, otherwise clear
    const available = variants.filter((v) => v.color === color).map((v) => v.size);
    if (selectedSize && !available.includes(selectedSize)) {
      setSelectedSize(null);
    }
  }

  function selectSize(size: string) {
    setSelectedSize(size);
  }

  function handleAddToCart() {
    if (!selectedVariant) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      slug: product.slug,
      name: product.name,
      nameMn: product.nameMn,
      price: product.price,
      quantity: 1,
      image: product.image,
      size: selectedVariant.size,
      color: selectedVariant.color,
    });
    openCart();
    onClose();
  }

  function handleBuyNow() {
    if (!selectedVariant) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      slug: product.slug,
      name: product.name,
      nameMn: product.nameMn,
      price: product.price,
      quantity: 1,
      image: product.image,
      size: selectedVariant.size,
      color: selectedVariant.color,
    });
    router.push(`/${locale}/checkout`);
  }

  return (
    <div
      className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col justify-end p-3 z-20"
      style={{ animation: "slideUpOverlay 0.2s ease-out" }}
      onClick={(e) => e.stopPropagation()}
    >
      <style>{`
        @keyframes slideUpOverlay {
          from { transform: translateY(8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
      >
        <X size={14} />
      </button>

      {/* Product name + price */}
      <p className="text-[11px] font-medium mb-1 pr-6 leading-snug">{displayName}</p>
      <div className="flex items-baseline gap-2 mb-3">
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <span className="text-[10px] text-gray-400 line-through">
            {formatPrice(product.compareAtPrice, locale as "mn" | "en")}
          </span>
        )}
        <span className="text-[11px]">{formatPrice(product.price, locale as "mn" | "en")}</span>
      </div>

      {loading ? (
        <div className="h-16 animate-pulse bg-gray-100 rounded mb-3" />
      ) : (
        <>
          {/* Color selector (only if multiple colors) */}
          {colors.length > 1 && (
            <div className="flex gap-1.5 mb-3">
              {colors.map(({ color, hex }) => (
                <button
                  key={color}
                  title={color}
                  onClick={() => selectColor(color)}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    selectedColor === color ? "border-black" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: hex ?? "#ccc" }}
                />
              ))}
            </div>
          )}

          {/* Size selector */}
          {sizes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => selectSize(size)}
                  className={`h-7 px-2 border text-[10px] transition-colors ${
                    selectedSize === size
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-black"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleAddToCart}
          disabled={!selectedVariant}
          className="flex-1 bg-black text-white text-[10px] py-2.5 disabled:opacity-40 hover:bg-gray-800 transition-colors"
        >
          {!selectedVariant
            ? (isMn ? "Хэмжээ сонгоно уу" : "Select size")
            : (isMn ? "Сагсанд" : "Add to cart")}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={!selectedVariant}
          className="flex-1 border border-black text-[10px] py-2.5 disabled:opacity-40 hover:bg-black hover:text-white transition-colors"
        >
          {isMn ? "Худалдан авах" : "Buy now"}
        </button>
      </div>

      {/* View full product link */}
      <Link
        href={`/${locale}/store/${product.slug}`}
        className="text-[10px] text-gray-400 underline underline-offset-2 mt-2 text-center hover:text-black block"
        onClick={(e) => e.stopPropagation()}
      >
        {isMn ? "Дэлгэрэнгүй →" : "View full details →"}
      </Link>
    </div>
  );
}
