"use client";

import { useState } from "react";
import { ReviewCard } from "@/components/product/ReviewCard";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  created_at: string;
  like_count: number;
  user_liked: boolean;
  reviewer_name: string;
  verified_purchase: boolean;
};

interface ReviewListProps {
  reviews: Review[];
  locale: string;
}

const T = {
  en: { sortBy: "Sort by", sortRecent: "Most Recent", sortHelpful: "Most Helpful" },
  mn: { sortBy: "Эрэмбэлэх", sortRecent: "Шинэ эхэнд", sortHelpful: "Хамгийн тустай" },
};

export function ReviewList({ reviews, locale }: ReviewListProps) {
  const t = T[locale === "mn" ? "mn" : "en"];
  const [sort, setSort] = useState<"recent" | "helpful">("recent");

  const sorted = [...reviews].sort((a, b) => {
    if (sort === "helpful") return b.like_count - a.like_count;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div>
      {reviews.length > 1 && (
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[11px] text-gray-500 uppercase tracking-wide">{t.sortBy}:</span>
          <button
            onClick={() => setSort("recent")}
            className={`text-[11px] tracking-wide transition-colors ${sort === "recent" ? "text-black" : "text-gray-400 hover:text-black"}`}
          >
            {t.sortRecent}
          </button>
          <span className="text-gray-200">|</span>
          <button
            onClick={() => setSort("helpful")}
            className={`text-[11px] tracking-wide transition-colors ${sort === "helpful" ? "text-black" : "text-gray-400 hover:text-black"}`}
          >
            {t.sortHelpful}
          </button>
        </div>
      )}

      {sorted.map((review) => (
        <ReviewCard key={review.id} review={review} locale={locale} />
      ))}
    </div>
  );
}
