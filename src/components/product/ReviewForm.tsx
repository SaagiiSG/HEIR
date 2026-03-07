"use client";

import { useState, useTransition } from "react";
import { StarRating } from "@/components/ui/StarRating";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { submitReview } from "@/lib/actions/reviews";

interface ReviewFormProps {
  productId: string;
  locale: string;
  existingReview?: {
    rating: number;
    title: string | null;
    body: string;
  } | null;
}

const T = {
  en: {
    writeReview: "Write a Review",
    editReview: "Edit Your Review",
    rating: "Rating",
    reviewTitle: "Review Title",
    reviewTitlePlaceholder: "Sum up your experience",
    reviewBody: "Your Review",
    reviewBodyPlaceholder: "What did you think of this product?",
    submit: "Submit Review",
    submitting: "Submitting...",
    submitted: "Review submitted. Thank you!",
    ratingRequired: "Please select a rating",
    bodyRequired: "Please write your review",
  },
  mn: {
    writeReview: "Сэтгэгдэл бичих",
    editReview: "Сэтгэгдэлээ засах",
    rating: "Үнэлгээ",
    reviewTitle: "Гарчиг",
    reviewTitlePlaceholder: "Туршлагаа товчоор тайлбарлана уу",
    reviewBody: "Сэтгэгдэл",
    reviewBodyPlaceholder: "Энэ бүтээгдэхүүний талаар юу гэж бодов?",
    submit: "Сэтгэгдэл илгээх",
    submitting: "Илгээж байна...",
    submitted: "Сэтгэгдэл амжилттай илгээгдлээ. Баярлалаа!",
    ratingRequired: "Үнэлгээ сонгоно уу",
    bodyRequired: "Сэтгэгдэл бичнэ үү",
  },
};

export function ReviewForm({ productId, locale, existingReview }: ReviewFormProps) {
  const t = T[locale === "mn" ? "mn" : "en"];
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [title, setTitle] = useState(existingReview?.title ?? "");
  const [body, setBody] = useState(existingReview?.body ?? "");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <p className="text-[13px] text-gray-500 py-4">{t.submitted}</p>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) { toast(t.ratingRequired, "error"); return; }
    if (!body.trim()) { toast(t.bodyRequired, "error"); return; }

    startTransition(async () => {
      const result = await submitReview(productId, rating, title.trim(), body.trim());
      if (result.error) {
        toast(result.error, "error");
      } else {
        toast(t.submitted, "success");
        setSubmitted(true);
      }
    });
  }

  return (
    <div className="border border-gray-100 p-5">
      <h3 className="text-[13px] uppercase tracking-wide mb-5">
        {existingReview ? t.editReview : t.writeReview}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide mb-2">{t.rating}</p>
          <StarRating value={rating} onChange={setRating} size="md" />
        </div>

        <Input
          label={t.reviewTitle}
          placeholder={t.reviewTitlePlaceholder}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />

        <div className="flex flex-col gap-1">
          <label className="text-[11px] tracking-wide uppercase">{t.reviewBody}</label>
          <textarea
            className="w-full border border-gray-300 px-3 py-2.5 text-[13px] outline-none focus:border-black transition-colors resize-none"
            rows={4}
            placeholder={t.reviewBodyPlaceholder}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={1000}
            required
          />
        </div>

        <Button type="submit" disabled={isPending} variant="solid" size="md">
          {isPending ? t.submitting : t.submit}
        </Button>
      </form>
    </div>
  );
}
