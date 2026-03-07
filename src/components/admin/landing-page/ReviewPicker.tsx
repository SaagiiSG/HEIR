"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search, Star } from "lucide-react";
import type { FeaturedReview } from "@/lib/landing-page-types";

interface PickerReview {
  reviewId: string;
  rating: number;
  title: string | null;
  content: string;
  reviewerName: string;
  productName_en: string;
  productName_mn: string;
  isApproved: boolean;
}

interface ReviewPickerProps {
  alreadySelected: string[]; // reviewIds already in featuredReviews
  onSelect: (review: FeaturedReview) => void;
  onClose: () => void;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3 h-3 ${n <= rating ? "fill-black text-black" : "text-gray-200"}`}
          strokeWidth={1}
        />
      ))}
    </div>
  );
}

export function ReviewPicker({ alreadySelected, onSelect, onClose }: ReviewPickerProps) {
  const [query, setQuery] = useState("");
  const [reviews, setReviews] = useState<PickerReview[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function fetchReviews(q: string) {
    setLoading(true);
    const params = new URLSearchParams({ q, limit: "30" });
    fetch(`/api/admin/landing-page/reviews?${params}`)
      .then((r) => r.json())
      .then((data) => { setReviews(data.reviews ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { fetchReviews(""); }, []);

  function handleSearch(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchReviews(value), 300);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-[600px] max-h-[80vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <p className="text-[13px] font-medium">Select a Review to Feature</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Click any review to add it to the landing page</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 border border-gray-200 px-3 py-2">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
            <input
              autoFocus
              type="text"
              placeholder="Search by reviewer, product, or content..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 text-[12px] outline-none bg-transparent placeholder-gray-400"
            />
          </div>
        </div>

        {/* Review list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-[12px] text-gray-400">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-[12px] text-gray-400">No reviews found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {reviews.map((review) => {
                const isAdded = alreadySelected.includes(review.reviewId);
                return (
                  <button
                    key={review.reviewId}
                    disabled={isAdded}
                    onClick={() => {
                      onSelect({
                        reviewId: review.reviewId,
                        reviewerName: review.reviewerName,
                        rating: review.rating,
                        title: review.title ?? undefined,
                        content: review.content,
                        productName_en: review.productName_en,
                        productName_mn: review.productName_mn,
                      });
                      onClose();
                    }}
                    className={`w-full text-left px-5 py-4 transition-colors ${
                      isAdded
                        ? "opacity-40 cursor-not-allowed bg-gray-50"
                        : "hover:bg-gray-50 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Stars rating={review.rating} />
                          {!review.isApproved && (
                            <span className="text-[9px] border border-orange-300 text-orange-500 px-1.5 py-0.5 rounded">
                              Unapproved
                            </span>
                          )}
                          {isAdded && (
                            <span className="text-[9px] border border-green-300 text-green-600 px-1.5 py-0.5 rounded">
                              Already added
                            </span>
                          )}
                        </div>
                        {review.title && (
                          <p className="text-[12px] font-medium mb-1">{review.title}</p>
                        )}
                        <p className="text-[11px] text-gray-600 leading-[1.5] line-clamp-2">
                          &ldquo;{review.content}&rdquo;
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] font-medium text-black">{review.reviewerName}</span>
                          {review.productName_en && (
                            <span className="text-[10px] text-gray-400">on {review.productName_en}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
