"use client";

import { useState, useTransition } from "react";
import { StarRating } from "@/components/ui/StarRating";
import { toggleLike } from "@/lib/actions/reviews";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  review: {
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
  locale: string;
}

const T = {
  en: { helpful: "Helpful", verifiedPurchase: "Verified Purchase" },
  mn: { helpful: "Тустай", verifiedPurchase: "Баталгаат худалдан авалт" },
};

export function ReviewCard({ review, locale }: ReviewCardProps) {
  const t = T[locale === "mn" ? "mn" : "en"];
  const [liked, setLiked] = useState(review.user_liked);
  const [likeCount, setLikeCount] = useState(review.like_count);
  const [isPending, startTransition] = useTransition();

  const initials = review.reviewer_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const date = new Date(review.created_at).toLocaleDateString(
    locale === "mn" ? "mn-MN" : "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  );

  function handleLike() {
    startTransition(async () => {
      const result = await toggleLike(review.id);
      if (!result.error) {
        setLiked((prev) => !prev);
        setLikeCount((prev) => prev + (liked ? -1 : 1));
      }
    });
  }

  return (
    <div className="border-b border-gray-100 py-6">
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar initials */}
        <div className="w-8 h-8 bg-gray-100 flex items-center justify-center flex-shrink-0">
          <span className="text-[11px] text-gray-600">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-medium">{review.reviewer_name}</span>
            {review.verified_purchase && (
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                {t.verifiedPurchase}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <StarRating value={review.rating} size="sm" />
            <span className="text-[11px] text-gray-400">{date}</span>
          </div>
        </div>
      </div>

      {review.title && (
        <p className="text-[13px] font-medium mb-1">{review.title}</p>
      )}
      <p className="text-[13px] leading-[1.7] text-gray-700 mb-4">{review.body}</p>

      <button
        onClick={handleLike}
        disabled={isPending}
        className={cn(
          "flex items-center gap-1.5 text-[11px] tracking-wide border px-3 py-1.5 transition-colors",
          liked
            ? "border-black bg-black text-white"
            : "border-gray-200 text-gray-500 hover:border-gray-400"
        )}
      >
        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
        </svg>
        {t.helpful} ({likeCount})
      </button>
    </div>
  );
}
