"use client";

import { useRef, useState, useEffect } from "react";
import { ProductHeroImage } from "./ProductHeroImage";
import { PhotoBuyOverlay } from "./PhotoBuyOverlay";

interface Variant {
  id: string;
  size: string;
  color: string;
  color_hex: string | null;
  stock: number;
}

interface ProductImageGalleryProps {
  images: { url: string; color_hex: string | null }[];
  alt: string;
  variants: Variant[];
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
}

export function ProductImageGallery({
  images,
  alt,
  variants,
  product,
  locale,
  isMn,
}: ProductImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [overlayIdx, setOverlayIdx] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Reset when images change
  useEffect(() => {
    setActiveIdx(0);
    setOverlayIdx(null);
    trackRef.current?.scrollTo({ left: 0, behavior: "instant" });
  }, [images]);

  function handleScroll() {
    const el = trackRef.current;
    if (!el) return;
    setActiveIdx(Math.round(el.scrollLeft / el.clientWidth));
    setOverlayIdx(null);
  }

  function goTo(i: number) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  function openOverlay(i: number) {
    setOverlayIdx((prev) => (prev === i ? null : i));
  }

  return (
    <>
      {/* ── Mobile: horizontal swipe carousel ── */}
      <div className="md:hidden">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {images.map(({ url, color_hex }, i) => (
            <div key={i} className="flex-none w-full snap-start">
              <div
                className="aspect-[3/4] bg-[#f5f5f5] relative overflow-hidden cursor-pointer"
                onClick={() => openOverlay(i)}
              >
                <ProductHeroImage src={url} alt={i === 0 ? alt : `${alt} — view ${i + 1}`} />
                {overlayIdx === i && (
                  <PhotoBuyOverlay
                    variants={variants}
                    photoColorHex={color_hex}
                    product={product}
                    locale={locale}
                    isMn={isMn}
                    onClose={() => setOverlayIdx(null)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-3">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Image ${i + 1}`}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                  i === activeIdx ? "bg-black" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Desktop: vertical stack ── */}
      <div className="hidden md:flex flex-col gap-2">
        {images.map(({ url, color_hex }, i) => (
          <div
            key={i}
            className="aspect-[3/4] bg-[#f5f5f5] relative overflow-hidden cursor-pointer"
            onClick={() => openOverlay(i)}
          >
            <ProductHeroImage src={url} alt={i === 0 ? alt : `${alt} — view ${i + 1}`} />
            {overlayIdx === i && (
              <PhotoBuyOverlay
                variants={variants}
                photoColorHex={color_hex}
                product={product}
                locale={locale}
                isMn={isMn}
                onClose={() => setOverlayIdx(null)}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
}
