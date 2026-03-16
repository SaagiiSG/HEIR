"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/Button";
import { VariantSelector } from "@/components/product/VariantSelector";
import { SizeGuide } from "@/components/product/SizeGuide";

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  color_hex: string | null;
  stock: number;
}

interface ProductActionsProps {
  product: {
    id: string;
    slug: string;
    name: string;
    nameMn: string;
    price: number;
    images: string[];
  };
  variants: ProductVariant[];
  locale: string;
  isMn: boolean;
}

export function ProductActions({ product, variants, locale, isMn }: ProductActionsProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  function handleAddToCart() {
    if (!selectedVariant) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      nameMn: product.nameMn,
      price: product.price,
      quantity: 1,
      image: product.images[0] ?? "",
      size: selectedVariant.size,
      color: selectedVariant.color,
      slug: product.slug,
    });
  }

  function handleBuyNow() {
    if (!selectedVariant) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      nameMn: product.nameMn,
      price: product.price,
      quantity: 1,
      image: product.images[0] ?? "",
      size: selectedVariant.size,
      color: selectedVariant.color,
      slug: product.slug,
    }, true);
    router.push(`/${locale}/checkout`);
  }

  return (
    <>
      <VariantSelector
        variants={variants.map((v) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          color_hex: v.color_hex ?? "#000",
          stock: v.stock,
        }))}
        selectedVariantId={selectedVariantId}
        onSelect={setSelectedVariantId}
      />

      <button
        onClick={() => setSizeGuideOpen(true)}
        className="text-[11px] underline underline-offset-2 hover:opacity-60 transition-opacity"
      >
        {isMn ? "Хэмжээний заавар" : "Size guide"}
      </button>

      <div className="flex flex-col gap-2">
        <Button
          variant="solid"
          size="lg"
          className="w-full"
          disabled={!selectedVariant || selectedVariant.stock === 0}
          onClick={handleAddToCart}
        >
          {!selectedVariant
            ? isMn ? "Хэмжээ сонгоно уу" : "Select size"
            : selectedVariant.stock === 0
            ? isMn ? "Дууссан" : "Out of stock"
            : isMn ? "Сагсанд нэмэх" : "Add to cart"}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          disabled={!selectedVariant || selectedVariant.stock === 0}
          onClick={handleBuyNow}
        >
          {isMn ? "Шууд худалдан авах" : "Buy Now"}
        </Button>
      </div>

      <SizeGuide isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </>
  );
}
