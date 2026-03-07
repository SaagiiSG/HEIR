"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  nameMn: string;
  brand: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  images?: string[]; // all images — used for hover/scroll cycling
  swatches?: string[];
  isNew?: boolean;
  isFeatured?: boolean;
}

interface ProductCardProps {
  product: ProductCardData;
  locale: string;
}

const CYCLE_MS = 700;
const FALLBACK = "https://placehold.co/400x400/f5f5f5/f5f5f5";

function isTouchOnly() {
  return typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;
}

export function ProductCard({ product, locale }: ProductCardProps) {
  const displayName = locale === "mn" ? product.nameMn : product.name;

  // Deduplicate, https-only, max 4 images
  const allImages = Array.from(
    new Set(
      [product.image, ...(product.images ?? [])].filter(
        (s): s is string => typeof s === "string" && s.startsWith("https://")
      )
    )
  ).slice(0, 4);
  if (allImages.length === 0) allImages.push(FALLBACK);

  const [activeIdx, setActiveIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cardRef = useRef<HTMLAnchorElement>(null);

  const startCycling = useCallback(() => {
    if (allImages.length <= 1 || intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % allImages.length);
    }, CYCLE_MS);
  }, [allImages.length]);

  const stopCycling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setActiveIdx(0);
  }, []);

  // Mobile: IntersectionObserver — start when 60% of card is visible
  useEffect(() => {
    const el = cardRef.current;
    if (!el || !isTouchOnly()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startCycling();
        } else {
          stopCycling();
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startCycling, stopCycling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <Link
      ref={cardRef}
      href={`/${locale}/store/${product.slug}`}
      className="group block"
      onMouseEnter={() => { if (!isTouchOnly()) startCycling(); }}
      onMouseLeave={() => { if (!isTouchOnly()) stopCycling(); }}
    >
      <div className="aspect-[3/4] bg-[#f0f0f0] mb-3 overflow-hidden relative">
        {allImages.map((src, i) => (
          <Image
            key={i}
            src={src}
            alt={i === 0 ? displayName : ""}
            fill
            className={`object-cover transition-opacity duration-500 ${
              i === activeIdx ? "opacity-100" : "opacity-0"
            }`}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={i === 0}
          />
        ))}

        {product.isFeatured && (
          <span className="absolute top-2 left-2 bg-black text-white text-[9px] tracking-widest px-2 py-0.5 z-10">
            {locale === "mn" ? "ОНЦЛОХ" : "FEATURED"}
          </span>
        )}

        {/* Cycling progress dots */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            {allImages.map((_, i) => (
              <span
                key={i}
                className={`block w-1 h-1 rounded-full transition-colors duration-300 ${
                  i === activeIdx ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-0.5">
        <p className="text-[10px] uppercase tracking-widest text-gray-400">{product.brand}</p>
        <p className="text-[11px] leading-snug">{displayName}</p>
        <div className="flex items-baseline gap-2">
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-[10px] text-gray-400 line-through">
              {formatPrice(product.compareAtPrice, locale as "mn" | "en")}
            </span>
          )}
          <span className="text-[11px]">{formatPrice(product.price, locale as "mn" | "en")}</span>
        </div>
      </div>
      {product.swatches && product.swatches.length > 0 && (
        <div className="flex gap-1.5 mt-2">
          {product.swatches.map((color, i) => (
            <span
              key={i}
              className="w-3 h-3 rounded-full border border-solid border-gray-300"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </Link>
  );
}
