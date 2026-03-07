"use client";

import { useState } from "react";
import Image from "next/image";

const FALLBACK = "https://placehold.co/600x800/f5f5f5/cccccc";

interface ProductHeroImageProps {
  src: string;
  alt: string;
}

export function ProductHeroImage({ src, alt }: ProductHeroImageProps) {
  const safeSrc = src.startsWith("https://") ? src : FALLBACK;
  const [imgSrc, setImgSrc] = useState(safeSrc);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, 50vw"
      priority
      onError={() => setImgSrc(FALLBACK)}
      unoptimized={imgSrc === FALLBACK}
    />
  );
}
