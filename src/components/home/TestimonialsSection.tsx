import { createClient } from "@/lib/supabase/server";
import { StarRating } from "@/components/ui/StarRating";

interface TestimonialsSectionProps {
  locale: string;
}

const T = {
  en: { title: "What Our Customers Say" },
  mn: { title: "Хэрэглэгчдийн сэтгэгдэл" },
};

export async function TestimonialsSection({ locale }: TestimonialsSectionProps) {
  const t = T[locale === "mn" ? "mn" : "en"];
  const supabase = await createClient();

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
      products ( name_en, name_mn )
    `)
    .eq("rating", 5)
    .order("created_at", { ascending: false })
    .limit(4);

  if (!rawReviews || rawReviews.length === 0) return null;

  const testimonials = rawReviews.map((r) => {
    const profile = r.profiles as unknown as { first_name: string; last_name: string } | null;
    const product = r.products as unknown as { name_en: string; name_mn: string } | null;
    return {
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      reviewer_name: profile
        ? `${profile.first_name} ${profile.last_name}`.trim() || "Customer"
        : "Customer",
      product_name: product
        ? (locale === "mn" ? product.name_mn : product.name_en)
        : null,
    };
  });

  return (
    <section className="px-5 py-14 border-t border-gray-200">
      <h2 className="text-[26px] font-normal leading-[1.15] mb-10">{t.title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {testimonials.map((item) => (
          <div key={item.id} className="border border-gray-100 p-5 flex flex-col gap-3">
            <StarRating value={item.rating} size="sm" />
            {item.title && (
              <p className="text-[13px] font-medium leading-[1.4]">{item.title}</p>
            )}
            <p className="text-[12px] leading-[1.7] text-gray-600 flex-1">&ldquo;{item.body}&rdquo;</p>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-[11px] font-medium">{item.reviewer_name}</p>
              {item.product_name && (
                <p className="text-[10px] text-gray-400 mt-0.5">{item.product_name}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
