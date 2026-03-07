"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitReview(
  productId: string,
  rating: number,
  title: string,
  body: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("reviews").upsert(
    { product_id: productId, user_id: user.id, rating, title, body },
    { onConflict: "product_id,user_id" }
  );

  if (error) return { error: error.message };

  revalidatePath(`/[locale]/store/[slug]`, "page");
  return {};
}

export async function toggleLike(reviewId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: existing } = await supabase
    .from("review_likes")
    .select("review_id")
    .eq("review_id", reviewId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("review_likes")
      .delete()
      .eq("review_id", reviewId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("review_likes")
      .insert({ review_id: reviewId, user_id: user.id });
    if (error) return { error: error.message };
  }

  revalidatePath(`/[locale]/store/[slug]`, "page");
  return {};
}
