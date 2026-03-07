"use client";

import { Star } from "lucide-react";
import type { LandingPageConfig } from "@/lib/landing-page-types";

interface LandingPagePreviewProps {
  config: LandingPageConfig;
}

function PillButton({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block border border-solid border-black rounded-full px-5 py-2 text-[10px] tracking-wide w-fit">
      {children}
    </span>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-2.5 h-2.5 ${n <= rating ? "fill-black text-black" : "text-gray-200"}`}
          strokeWidth={1}
        />
      ))}
    </div>
  );
}

export function LandingPagePreview({ config }: LandingPagePreviewProps) {
  const reviews = config.featuredReviews ?? [];
  const exclusive = config.exclusive ?? [];
  const faq = config.faq ?? [];

  return (
    <div className="pointer-events-none select-none overflow-y-auto h-full bg-white text-black font-sans">
      {/* ── Hero ── */}
      <section className="grid grid-cols-2" style={{ minHeight: "50vh" }}>
        <div className="flex flex-col justify-end px-4 pb-8 pt-8">
          <h1 className="text-[18px] font-normal leading-[1.2] mb-2 whitespace-pre-line">
            {config.hero.heading_en || "Mongolian Craft,\nModern Wear"}
          </h1>
          <p className="text-[10px] text-black mb-5 mt-1">{config.hero.subtitle_en || "Premium menswear from Mongolia"}</p>
          <PillButton>{config.hero.cta_en || "Shop Now"}</PillButton>
        </div>
        <div className="bg-[#1a1a2e] relative overflow-hidden" style={{ minHeight: "200px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={config.hero.imageUrl}
            alt={config.hero.imageAlt}
            className="w-full h-full object-cover absolute inset-0"
          />
        </div>
      </section>

      {/* ── New In ── */}
      <section className="px-4 py-8 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <div className="flex flex-col pr-2">
            <h2 className="text-[16px] font-normal leading-[1.15] mb-4">New In</h2>
            <PillButton>Shop New In</PillButton>
          </div>
          {config.newIn.slice(0, 3).map((slot, i) => (
            <div key={i}>
              <div className="aspect-square bg-[#f5f5f5] mb-2 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slot.productImageUrl} alt={slot.productName_en} className="w-full h-full object-cover" />
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-[9px]">heir</span>
                {slot.productPrice > 0 && <span className="text-[9px]">₮{slot.productPrice.toLocaleString()}</span>}
              </div>
              <p className="text-[9px] leading-[1.4] text-gray-600 line-clamp-2">
                {slot.productId ? slot.productName_en : "Coming soon"}
              </p>
              {slot.colorSwatches.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {slot.colorSwatches.slice(0, 3).map((hex) => (
                    <span key={hex} className="w-2 h-2 rounded-full border border-gray-200" style={{ backgroundColor: hex }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div />
          {config.newIn.slice(3, 6).map((slot, i) => (
            <div key={i}>
              <div className="aspect-square bg-[#f5f5f5] mb-2 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slot.productImageUrl} alt={slot.productName_en} className="w-full h-full object-cover" />
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-[9px]">heir</span>
                {slot.productPrice > 0 && <span className="text-[9px]">₮{slot.productPrice.toLocaleString()}</span>}
              </div>
              <p className="text-[9px] leading-[1.4] text-gray-600 line-clamp-2">
                {slot.productId ? slot.productName_en : "Coming soon"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Collections ── */}
      <section className="px-4 py-4 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-3 mb-3">
          {config.collections.slice(0, 4).map((col, i) => (
            <div key={i}>
              <div className="aspect-square bg-[#f5f5f5] mb-2 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={col.imageUrl} alt={col.label_en} className="w-full h-full object-cover" />
              </div>
              <p className="text-[9px] leading-[1.3]">{col.label_en}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-3">
          {config.collections.slice(4, 8).map((col, i) => (
            <div key={i}>
              <div className="aspect-square bg-[#f5f5f5] mb-2 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={col.imageUrl} alt={col.label_en} className="w-full h-full object-cover" />
              </div>
              <p className="text-[9px] leading-[1.3]">{col.label_en}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Heir Exclusive ── */}
      <section className="px-4 py-8 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-3">
          <div className="flex flex-col pr-2">
            <h2 className="text-[16px] font-normal leading-[1.15] mb-4">Heir Exclusive</h2>
            <PillButton>Shop All</PillButton>
          </div>
          {exclusive.slice(0, 3).map((slot, i) => (
            <div key={i}>
              <div className="aspect-square bg-[#f5f5f5] mb-2 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slot.productImageUrl} alt={slot.productName_en} className="w-full h-full object-cover" />
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-[9px]">heir</span>
                {slot.productPrice > 0 && <span className="text-[9px]">₮{slot.productPrice.toLocaleString()}</span>}
              </div>
              <p className="text-[9px] leading-[1.4] text-gray-600 line-clamp-2">
                {slot.productId ? slot.productName_en : "Coming soon"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Reviews ── */}
      {reviews.length > 0 && (
        <section className="px-4 py-8 border-t border-gray-200">
          <h2 className="text-[16px] font-normal leading-[1.15] mb-6">What Our Customers Say</h2>
          <div className="grid grid-cols-3 gap-3">
            {reviews.slice(0, 6).map((review) => (
              <div key={review.reviewId} className="border border-gray-100 p-4 flex flex-col gap-2">
                <Stars rating={review.rating} />
                {review.title && (
                  <p className="text-[10px] font-medium leading-[1.3]">{review.title}</p>
                )}
                <p className="text-[9px] text-gray-600 leading-[1.6] flex-1 line-clamp-4">
                  &ldquo;{review.content}&rdquo;
                </p>
                <div className="border-t border-gray-100 pt-2 mt-1">
                  <p className="text-[9px] font-medium">{review.reviewerName}</p>
                  {review.productName_en && (
                    <p className="text-[8px] text-gray-400 mt-0.5">{review.productName_en}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {reviews.length === 0 && (
        <section className="px-4 py-8 border-t border-gray-200">
          <div className="border border-dashed border-gray-200 p-8 text-center">
            <p className="text-[10px] text-gray-300">Reviews section — add reviews in the Reviews tab</p>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      {faq.length > 0 && (
        <section className="px-4 py-8 border-t border-gray-200">
          <h2 className="text-[16px] font-normal leading-[1.15] mb-5">FAQ</h2>
          <div className="space-y-0">
            {faq.map((item) => (
              <div key={item.id} className="border-b border-gray-100 py-3">
                <p className="text-[10px] font-medium">{item.question_en}</p>
                <p className="text-[9px] text-gray-500 mt-1 leading-[1.6] line-clamp-2">{item.answer_en}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {faq.length === 0 && (
        <section className="px-4 py-8 border-t border-gray-200">
          <div className="border border-dashed border-gray-200 p-8 text-center">
            <p className="text-[10px] text-gray-300">FAQ section — add questions in the FAQ tab</p>
          </div>
        </section>
      )}
    </div>
  );
}
