"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteProduct(productId: string) {
  const supabase = createAdminClient();

  const { data: variantRows } = await supabase
    .from("product_variants")
    .select("id")
    .eq("product_id", productId);

  if (variantRows?.length) {
    await supabase
      .from("inventory")
      .delete()
      .in("variant_id", variantRows.map((v) => v.id));
  }

  await supabase.from("product_variants").delete().eq("product_id", productId);
  await supabase.from("product_images").delete().eq("product_id", productId);
  await supabase.from("order_items").delete().eq("product_id", productId);

  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw new Error(error.message);

  revalidatePath("/mn/admin/products");
  revalidatePath("/en/admin/products");
}

interface VariantInput {
  size: string;
  color_name_en: string;
  color_hex: string;
  stock: number;
  images: string[];
}

interface ImageInput {
  url: string;
  is_primary: boolean;
}

export async function saveProduct(
  productId: string,
  fields: {
    name_en: string;
    name_mn: string;
    description_en: string;
    description_mn: string;
    base_price: number;
    compare_at_price: number | null;
    category_id: string | null;
    is_active: boolean;
    is_featured: boolean;
  },
  images: ImageInput[],
  variants: VariantInput[],
) {
  const supabase = createAdminClient();

  // Update product fields
  const { data: product, error: updateError } = await supabase
    .from("products")
    .update(fields)
    .eq("id", productId)
    .select("slug")
    .single();

  if (updateError) throw new Error(updateError.message);
  const slug = product?.slug ?? productId;

  // Sync images: wipe and reinsert
  await supabase.from("product_images").delete().eq("product_id", productId);

  const regularRows = images.map((img, i) => ({
    product_id: productId,
    url: img.url,
    is_primary: img.is_primary,
    sort_order: i,
    color_hex: null as string | null,
  }));

  // Per-color images from variants (deduplicated by color_hex)
  const seenColors = new Map<string, string[]>();
  for (const v of variants) {
    if (!seenColors.has(v.color_hex)) seenColors.set(v.color_hex, v.images ?? []);
  }
  const colorRows: typeof regularRows = [];
  let sortOrder = images.length;
  for (const [colorHex, urls] of seenColors) {
    for (const url of urls) {
      colorRows.push({ product_id: productId, url, is_primary: false, sort_order: sortOrder++, color_hex: colorHex });
    }
  }

  const allImageRows = [...regularRows, ...colorRows];
  if (allImageRows.length > 0) {
    await supabase.from("product_images").insert(allImageRows);
  }

  // Sync products.images TEXT[]
  const allUrls = allImageRows.map((r) => r.url);
  await supabase.from("products").update({ images: allUrls }).eq("id", productId);

  // Sync variants: wipe then reinsert
  const { data: oldVariants } = await supabase
    .from("product_variants")
    .select("id")
    .eq("product_id", productId);

  if (oldVariants?.length) {
    await supabase.from("inventory").delete().in("variant_id", oldVariants.map((v) => v.id));
  }
  await supabase.from("product_variants").delete().eq("product_id", productId);

  for (const variant of variants) {
    if (!variant.size) continue; // skip placeholder rows
    const colorSlug = variant.color_name_en.toLowerCase().replace(/\s+/g, "-");
    const sku = `${slug}-${variant.size}-${colorSlug}`.slice(0, 60);

    const { data: inserted } = await supabase
      .from("product_variants")
      .insert({
        product_id: productId,
        size: variant.size,
        color: variant.color_name_en,
        color_hex: variant.color_hex,
        sku,
        stock: variant.stock,
      })
      .select("id")
      .single();

    if (inserted) {
      await supabase.from("inventory").insert({ variant_id: inserted.id, quantity: variant.stock });
    }
  }
}
