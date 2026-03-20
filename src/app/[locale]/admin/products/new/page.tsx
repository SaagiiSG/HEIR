"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import { createClient } from "@/lib/supabase/client";
import type { VariantDraft } from "@/components/admin/VariantManager";
import type { UploadedImage } from "@/components/admin/ImageUploader";
import { AdminBackLink } from "@/components/admin/AdminBackLink";

export default function NewProductPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) ?? "mn";

  const [categories, setCategories] = useState<{ id: string; name_mn: string; name_en: string }[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("categories").select("id, slug, name_mn, name_en").order("name_en").then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  async function handleSubmit(data: {
    name_mn: string;
    name_en: string;
    description_mn: string;
    description_en: string;
    base_price: number;
    compare_at_price: number | null;
    category_id: string;
    is_active: boolean;
    is_featured: boolean;
    variants: VariantDraft[];
    images: UploadedImage[];
  }) {
    const supabase = createClient();

    // Generate slug from English name
    const slug = data.name_en
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      + "-" + Math.random().toString(36).slice(2, 6);

    // Insert product
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        slug,
        name_en: data.name_en,
        name_mn: data.name_mn,
        description_en: data.description_en,
        description_mn: data.description_mn,
        base_price: data.base_price,
        compare_at_price: data.compare_at_price || null,
        category_id: data.category_id || null,
        is_active: data.is_active,
        is_featured: data.is_featured,
      })
      .select("id")
      .single();

    if (productError || !product) {
      alert(productError?.message ?? "Failed to create product");
      return;
    }

    // Insert product images
    if (data.images.length > 0) {
      await supabase.from("product_images").insert(
        data.images.map((img, i) => ({
          product_id: product.id,
          url: img.url,
          is_primary: img.is_primary,
          sort_order: i,
        }))
      );

      // Sync products.images TEXT[] (primary first, then rest in order)
      const orderedUrls = [
        ...data.images.filter((img) => img.is_primary),
        ...data.images.filter((img) => !img.is_primary),
      ].map((img) => img.url);
      await supabase.from("products").update({ images: orderedUrls }).eq("id", product.id);
    }

    // Insert variants + inventory
    for (const variant of data.variants) {
      const colorSlug = variant.color_name_en.toLowerCase().replace(/\s+/g, "-");
      const sku = `${slug}-${variant.size}-${colorSlug}`.slice(0, 60);
      const { data: insertedVariant } = await supabase
        .from("product_variants")
        .insert({
          product_id: product.id,
          size: variant.size,
          color: variant.color_name_en,
          color_hex: variant.color_hex,
          sku,
          stock: variant.stock,
        })
        .select("id")
        .single();

      if (insertedVariant) {
        await supabase.from("inventory").insert({
          variant_id: insertedVariant.id,
          quantity: variant.stock,
        });
      }
    }

    router.push(`/${locale}/admin/products`);
  }

  return (
    <div className="max-w-[900px]">
      <div className="flex items-center gap-3 mb-8">
        <AdminBackLink href={`/${locale}/admin/products`} locale={locale} />
        <h1 className="text-[20px] font-normal">
          {locale === "mn" ? "Шинэ бараа" : "New Product"}
        </h1>
      </div>

      <div className="bg-white border border-gray-100 p-8">
        <ProductForm
          categories={categories}
          onSubmit={handleSubmit}
          locale={locale}
        />
      </div>
    </div>
  );
}
