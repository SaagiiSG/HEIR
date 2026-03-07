"use client";

import { useRef, useState } from "react";
import { ProductHeroImage } from "./ProductHeroImage";

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
}

export function ProductImageGallery({ images, alt }: ProductImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  function handleScroll() {
    const el = trackRef.current;
    if (!el) return;
    setActiveIdx(Math.round(el.scrollLeft / el.clientWidth));
  }

  function goTo(i: number) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
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
          {images.map((src, i) => (
            <div key={i} className="flex-none w-full snap-start">
              <div className="aspect-[3/4] bg-[#f5f5f5] relative overflow-hidden">
                <ProductHeroImage src={src} alt={i === 0 ? alt : `${alt} — view ${i + 1}`} />
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
        {images.map((src, i) => (
          <div key={i} className="aspect-[3/4] bg-[#f5f5f5] relative overflow-hidden">
            <ProductHeroImage src={src} alt={i === 0 ? alt : `${alt} — view ${i + 1}`} />
          </div>
        ))}
      </div>
    </>
  );
}
