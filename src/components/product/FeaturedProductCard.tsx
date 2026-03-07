"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";

export interface FeaturedProductCardData {
  id: string;
  slug: string;
  name: string;
  nameMn: string;
  brand: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
}

interface FeaturedProductCardProps {
  product: FeaturedProductCardData;
  locale: string;
}

export function FeaturedProductCard({ product, locale }: FeaturedProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const isMn = locale === "mn";
  const name = isMn ? product.nameMn : product.name;

  return (
    <Link
      href={`/${locale}/store/${product.slug}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Portrait image */}
      <div className="aspect-[2/3] overflow-hidden bg-gray-100">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={name}
            className="w-full h-full object-cover"
            style={{
              transform: hovered ? "scale(1.03)" : "scale(1)",
              transition: "transform 500ms ease",
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>

      {/* Info */}
      <div className="mt-3 space-y-0.5">
        <p className="text-[10px] uppercase tracking-widest text-gray-400">{product.brand}</p>
        <p className="text-[13px] font-normal leading-snug">{name}</p>
        <div className="flex items-baseline gap-2">
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-[12px] text-gray-400 line-through">
              {formatPrice(product.compareAtPrice, locale as "mn" | "en")}
            </span>
          )}
          <span className="text-[13px]">
            {formatPrice(product.price, locale as "mn" | "en")}
          </span>
        </div>
      </div>
    </Link>
  );
}
