"use client";

import { useState } from "react";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { ProductActions } from "@/components/product/ProductActions";
import { formatPrice } from "@/lib/utils";

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  color_hex: string | null;
  stock: number;
}

interface ProductDetailClientProps {
  galleryImages: string[];
  colorImageMap: Record<string, string[]>;
  alt: string;
  product: {
    id: string;
    slug: string;
    name: string;
    nameMn: string;
    price: number;
    compareAtPrice: number | null;
    images: string[];
    brand: string;
    descriptionEn: string | null;
    descriptionMn: string | null;
  };
  variants: ProductVariant[];
  locale: string;
  isMn: boolean;
}

export function ProductDetailClient({
  galleryImages,
  colorImageMap,
  alt,
  product,
  variants,
  locale,
  isMn,
}: ProductDetailClientProps) {
  const [selectedColorHex, setSelectedColorHex] = useState<string | null>(null);

  const displayImages =
    selectedColorHex && colorImageMap[selectedColorHex]?.length
      ? colorImageMap[selectedColorHex]
      : galleryImages;

  const productForActions = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    nameMn: product.nameMn,
    price: product.price,
    images: product.images,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-[1100px] mx-auto">
      {/* ── Image gallery ── */}
      <ProductImageGallery
        images={displayImages}
        alt={alt}
      />

      {/* ── Product info — sticky on desktop ── */}
      <div className="space-y-6 md:pt-4 md:sticky md:top-6 md:self-start">
        <div>
          <p className="text-[11px] text-gray-500 mb-2">{product.brand}</p>
          <h1 className="text-[20px] font-normal mb-3">
            {isMn ? product.nameMn : product.name}
          </h1>
          <div className="flex items-baseline gap-3">
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-[15px] text-gray-400 line-through">
                {formatPrice(product.compareAtPrice, locale as "mn" | "en")}
              </span>
            )}
            <span className="text-[17px]">
              {formatPrice(product.price, locale as "mn" | "en")}
            </span>
          </div>
        </div>

        <ProductActions
          product={productForActions}
          variants={variants}
          locale={locale}
          isMn={isMn}
          onColorChange={setSelectedColorHex}
        />

        <div className="border-t border-gray-100 pt-6">
          <p className="text-[11px] uppercase tracking-wide mb-2">
            {isMn ? "Тайлбар" : "Description"}
          </p>
          <p className="text-[13px] leading-[1.7]">
            {isMn ? product.descriptionMn : product.descriptionEn}
          </p>
        </div>
      </div>
    </div>
  );
}
