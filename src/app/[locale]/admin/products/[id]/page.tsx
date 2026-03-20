"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import { createClient } from "@/lib/supabase/client";
import type { VariantDraft } from "@/components/admin/VariantManager";
import type { UploadedImage } from "@/components/admin/ImageUploader";
import { AdminBackLink } from "@/components/admin/AdminBackLink";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) ?? "mn";
  const productId = params.id as string;

  const [categories, setCategories] = useState<{ id: string; slug: string; name_mn: string; name_en: string }[]>([]);
  const [initialData, setInitialData] = useState<Parameters<typeof ProductForm>[0]["initialData"]>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    Promise.all([
      supabase.from("categories").select("id, slug, name_mn, name_en").order("name_en"),
      supabase
        .from("products")
        .select("*, product_images(*), product_variants(*)")
        .eq("id", productId)
        .single(),
    ]).then(([catRes, productRes]) => {
      if (catRes.data) setCategories(catRes.data);

      if (productRes.data) {
        const p = productRes.data;
        setInitialData({
          name_mn: p.name_mn,
          name_en: p.name_en,
          description_mn: p.description_mn ?? "",
          description_en: p.description_en ?? "",
          base_price: p.base_price,
          compare_at_price: p.compare_at_price ?? null,
          category_id: p.category_id ?? "",
          is_active: p.is_active,
          is_featured: p.is_featured ?? false,
          images: (p.product_images ?? []).map((img: { id: string; url: string; is_primary: boolean }) => ({
            id: img.id,
            url: img.url,
            is_primary: img.is_primary,
          })),
          variants: (p.product_variants ?? []).map((v: { id: string; size: string; color: string; color_hex: string | null; stock: number; sku: string | null }) => ({
            id: v.id,
            size: v.size,
            color_name_en: v.color,
            color_name_mn: v.color,
            color_hex: v.color_hex ?? "",
            stock: v.stock,
            sku: v.sku ?? "",
          })),
        });
      }

      setLoading(false);
    });
  }, [productId]);

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

    // Update product
    const { error: updateError } = await supabase
      .from("products")
      .update({
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
      .eq("id", productId);

    if (updateError) {
      alert(updateError.message);
      return;
    }

    // Sync images: delete all existing, re-insert current set
    await supabase.from("product_images").delete().eq("product_id", productId);
    if (data.images.length > 0) {
      await supabase.from("product_images").insert(
        data.images.map((img, i) => ({
          product_id: productId,
          url: img.url,
          is_primary: img.is_primary,
          sort_order: i,
        }))
      );
    }

    // Sync products.images TEXT[] (primary first, then rest in order)
    const orderedUrls = [
      ...data.images.filter((img) => img.is_primary),
      ...data.images.filter((img) => !img.is_primary),
    ].map((img) => img.url);
    await supabase.from("products").update({ images: orderedUrls.length ? orderedUrls : [] }).eq("id", productId);

    // Sync variants: delete all existing, re-insert current set
    await supabase.from("product_variants").delete().eq("product_id", productId);
    for (const variant of data.variants) {
      const { data: productData } = await supabase
        .from("products")
        .select("slug")
        .eq("id", productId)
        .single();
      const slug = productData?.slug ?? productId;
      const colorSlug = variant.color_name_en.toLowerCase().replace(/\s+/g, "-");
      const sku = `${slug}-${variant.size}-${colorSlug}`.slice(0, 60);

      const { data: insertedVariant } = await supabase
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

      if (insertedVariant) {
        await supabase.from("inventory").upsert({
          variant_id: insertedVariant.id,
          quantity: variant.stock,
        });
      }
    }

    router.push(`/${locale}/admin/products`);
  }

  async function handleDelete() {
    if (!confirm(locale === "mn" ? "Устгах уу?" : "Delete this product?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) {
      alert(error.message);
      return;
    }
    router.push(`/${locale}/admin/products`);
  }

  if (loading) {
    return (
      <div className="max-w-[900px]">
        <p className="text-[13px] text-gray-400">{locale === "mn" ? "Уншиж байна..." : "Loading..."}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[900px]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <AdminBackLink href={`/${locale}/admin/products`} locale={locale} />
          <h1 className="text-[20px] font-normal">
            {locale === "mn" ? "Бараа засах" : "Edit Product"}
          </h1>
        </div>
        <button
          onClick={handleDelete}
          className="text-[12px] text-red-500 hover:underline"
        >
          {locale === "mn" ? "Устгах" : "Delete"}
        </button>
      </div>

      <div className="bg-white border border-gray-100 p-8">
        <ProductForm
          initialData={initialData}
          categories={categories}
          onSubmit={handleSubmit}
          locale={locale}
        />
      </div>
    </div>
  );
}
