"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";

interface Variant {
  id: string;
  size: string;
  color: string;
  color_hex: string | null;
  stock: number;
}

interface PhotoBuyOverlayProps {
  variants: Variant[];
  photoColorHex: string | null;
  product: {
    id: string;
    slug: string;
    name: string;
    nameMn: string;
    price: number;
    images: string[];
  };
  locale: string;
  isMn: boolean;
  onClose: () => void;
}

export function PhotoBuyOverlay({
  variants,
  photoColorHex,
  product,
  locale,
  isMn,
  onClose,
}: PhotoBuyOverlayProps) {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Filter to the photo's color if tagged, otherwise use all variants
  const colorVariants = photoColorHex
    ? variants.filter((v) => v.color_hex === photoColorHex)
    : variants;
  const pool = colorVariants.length > 0 ? colorVariants : variants;

  const sizes = [...new Set(pool.map((v) => v.size))];

  const selectedVariant = pool.find((v) => v.size === selectedSize && v.stock > 0) ?? null;

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
      image: product.images[0] ?? "",
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
      image: product.images[0] ?? "",
      size: selectedVariant.size,
      color: selectedVariant.color,
    });
    router.push(`/${locale}/checkout`);
  }

  return (
    <div
      className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm p-4 z-20"
      style={{ animation: "slideUp 0.22s ease-out" }}
      onClick={(e) => e.stopPropagation()}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-black transition-colors"
      >
        <X size={15} />
      </button>

      {/* Size buttons */}
      <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-2 pr-5">
        {isMn ? "Хэмжээ сонгоно уу" : "Select size"}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {sizes.map((size) => {
          const available = pool.some((v) => v.size === size && v.stock > 0);
          const isSelected = selectedSize === size;
          return (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              disabled={!available}
              className={`h-8 min-w-[40px] px-2.5 border text-[11px] transition-colors ${
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

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleAddToCart}
          disabled={!selectedVariant}
          className="flex-1 bg-black text-white text-[11px] py-2.5 disabled:opacity-40 hover:bg-gray-800 transition-colors"
        >
          {isMn ? "Сагсанд нэмэх" : "Add to cart"}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={!selectedVariant}
          className="flex-1 border border-black text-[11px] py-2.5 disabled:opacity-40 hover:bg-black hover:text-white transition-colors"
        >
          {isMn ? "Худалдан авах" : "Buy now"}
        </button>
      </div>
    </div>
  );
}
