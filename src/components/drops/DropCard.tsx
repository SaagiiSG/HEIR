import Link from "next/link";
import Image from "next/image";
import { Countdown } from "./Countdown";

export interface DropCardData {
  id: string;
  slug: string;
  title_mn: string;
  title_en: string;
  description_mn?: string;
  description_en?: string;
  image_url?: string;
  starts_at: string;
  ends_at?: string;
  is_active: boolean;
  product_count?: number;
}

interface DropCardProps {
  drop: DropCardData;
  locale: string;
}

export function DropCard({ drop, locale }: DropCardProps) {
  const title = locale === "mn" ? drop.title_mn : drop.title_en;
  const description = locale === "mn" ? drop.description_mn : drop.description_en;
  const isUpcoming = new Date(drop.starts_at) > new Date();
  const isEnded = drop.ends_at ? new Date(drop.ends_at) < new Date() : false;

  return (
    <Link href={`/${locale}/drops/${drop.slug}`} className="group block">
      {/* Image */}
      <div className="aspect-[3/4] bg-[#f5f5f5] mb-4 overflow-hidden relative">
        {drop.image_url ? (
          <Image
            src={drop.image_url}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full bg-[#1a1a2e] flex items-end p-6">
            <p className="text-white text-[11px] uppercase tracking-widest">{title}</p>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          {isEnded ? (
            <span className="bg-gray-500 text-white text-[10px] uppercase tracking-widest px-2.5 py-1">
              {locale === "mn" ? "Дууссан" : "Ended"}
            </span>
          ) : drop.is_active ? (
            <span className="bg-black text-white text-[10px] uppercase tracking-widest px-2.5 py-1">
              {locale === "mn" ? "Нээлттэй" : "Live"}
            </span>
          ) : isUpcoming ? (
            <span className="bg-white text-black text-[10px] uppercase tracking-widest px-2.5 py-1 border border-black">
              {locale === "mn" ? "Удахгүй" : "Coming Soon"}
            </span>
          ) : null}
        </div>
      </div>

      {/* Info */}
      <h2 className="text-[15px] font-normal mb-1">{title}</h2>
      {description && (
        <p className="text-[12px] text-gray-500 leading-[1.6] mb-3 line-clamp-2">{description}</p>
      )}

      {/* Countdown for upcoming */}
      {isUpcoming && !isEnded && (
        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">
            {locale === "mn" ? "Эхлэх хүртэл" : "Starts in"}
          </p>
          <Countdown targetDate={drop.starts_at} locale={locale} />
        </div>
      )}

      {drop.product_count !== undefined && (
        <p className="text-[11px] text-gray-400 mt-2">
          {drop.product_count} {locale === "mn" ? "бараа" : "items"}
        </p>
      )}
    </Link>
  );
}
