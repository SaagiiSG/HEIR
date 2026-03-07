import { createClient } from "@/lib/supabase/server";
import { ReviewSummary } from "@/components/product/ReviewSummary";
import { ReviewList } from "@/components/product/ReviewList";
import { ReviewForm } from "@/components/product/ReviewForm";

interface ReviewSectionProps {
  productId: string;
  locale: string;
}

const T = {
  en: {
    title: "Customer Reviews",
    noReviews: "No reviews yet. Be the first to share your thoughts.",
  },
  mn: {
    title: "Хэрэглэгчийн сэтгэгдэл",
    noReviews: "Одоогоор сэтгэгдэл байхгүй байна.",
  },
};

export async function ReviewSection({ productId, locale }: ReviewSectionProps) {
  const t = T[locale === "mn" ? "mn" : "en"];
  const supabase = await createClient();

  // Current user
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch reviews with profile name and like counts
  const { data: rawReviews } = await supabase
    .from("reviews")
    .select(`
      id,
      rating,
      title,
      body,
      created_at,
      user_id,
      profiles ( first_name, last_name ),
      review_likes ( user_id )
    `)
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  // Check if current user has a verified purchase
  let hasPurchased = false;
  let existingReview = null;

  if (user) {
    const { data: orderItem } = await supabase
      .from("order_items")
      .select("id, orders!inner(user_id, status)")
      .eq("product_id", productId)
      .filter("orders.user_id", "eq", user.id)
      .in("orders.status", ["paid", "processing", "shipped", "delivered"])
      .limit(1)
      .maybeSingle();

    hasPurchased = !!orderItem;

    const userReview = rawReviews?.find((r) => r.user_id === user.id);
    if (userReview) {
      const profile = userReview.profiles as unknown as { first_name: string; last_name: string } | null;
      existingReview = {
        rating: userReview.rating,
        title: userReview.title,
        body: userReview.body,
        reviewer_name: profile
          ? `${profile.first_name} ${profile.last_name}`.trim()
          : "You",
      };
    }
  }

  // Shape reviews for display
  const reviews = (rawReviews ?? []).map((r) => {
    const profile = r.profiles as unknown as { first_name: string; last_name: string } | null;
    const likes = r.review_likes as unknown as { user_id: string }[];
    return {
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      created_at: r.created_at,
      like_count: likes.length,
      user_liked: user ? likes.some((l) => l.user_id === user.id) : false,
      reviewer_name: profile
        ? `${profile.first_name} ${profile.last_name}`.trim() || "Anonymous"
        : "Anonymous",
      verified_purchase: false, // could join orders but expensive; mark via separate logic if needed
    };
  });

  // Aggregate stats
  const totalCount = reviews.length;
  const averageRating =
    totalCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount
      : 0;
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => { distribution[r.rating] = (distribution[r.rating] ?? 0) + 1; });

  return (
    <section className="border-t border-gray-100 mt-10 pt-8">
      <h2 className="text-[13px] uppercase tracking-wide mb-6">{t.title}</h2>

      {totalCount > 0 && (
        <ReviewSummary
          averageRating={averageRating}
          totalCount={totalCount}
          distribution={distribution}
          locale={locale}
        />
      )}

      {user && hasPurchased && (
        <div className="my-6">
          <ReviewForm
            productId={productId}
            locale={locale}
            existingReview={existingReview ? { rating: existingReview.rating, title: existingReview.title, body: existingReview.body } : null}
          />
        </div>
      )}

      {totalCount > 0 ? (
        <ReviewList reviews={reviews} locale={locale} />
      ) : (
        !hasPurchased && (
          <p className="text-[13px] text-gray-400 py-4">{t.noReviews}</p>
        )
      )}
    </section>
  );
}
