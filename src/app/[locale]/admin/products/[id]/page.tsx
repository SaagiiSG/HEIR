"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import { createClient } from "@/lib/supabase/client";
import type { VariantDraft } from "@/components/admin/VariantManager";
import type { UploadedImage } from "@/components/admin/ImageUploader";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { deleteProduct, saveProduct } from "@/lib/actions/products";

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

        // Build per-color image map from product_images tagged with color_hex
        const colorImgsByHex: Record<string, string[]> = {};
        for (const img of p.product_images ?? []) {
          if (img.color_hex) {
            (colorImgsByHex[img.color_hex] ??= []).push(img.url);
          }
        }

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
          images: (p.product_images ?? [])
            .filter((img: { color_hex: string | null }) => !img.color_hex)
            .map((img: { id: string; url: string; is_primary: boolean }) => ({
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
            images: colorImgsByHex[v.color_hex ?? ""] ?? [],
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
    try {
      await saveProduct(
        productId,
        {
          name_en: data.name_en,
          name_mn: data.name_mn,
          description_en: data.description_en,
          description_mn: data.description_mn,
          base_price: data.base_price,
          compare_at_price: data.compare_at_price || null,
          category_id: data.category_id || null,
          is_active: data.is_active,
          is_featured: data.is_featured,
        },
        data.images,
        data.variants,
      );
      router.push(`/${locale}/admin/products`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save product");
    }
  }

  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleDelete() {
    if (!deleteConfirming) { setDeleteConfirming(true); return; }
    setDeleteLoading(true);
    try {
      await deleteProduct(productId);
      router.push(`/${locale}/admin/products`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete product");
      setDeleteLoading(false);
      setDeleteConfirming(false);
    }
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
        {deleteConfirming ? (
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-gray-500">
              {locale === "mn" ? "Итгэлтэй юу?" : "Sure?"}
            </span>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="text-[12px] text-red-500 hover:underline disabled:opacity-50"
            >
              {deleteLoading ? "..." : locale === "mn" ? "Тийм" : "Yes, delete"}
            </button>
            <button
              onClick={() => setDeleteConfirming(false)}
              className="text-[12px] text-gray-400 hover:underline"
            >
              {locale === "mn" ? "Үгүй" : "Cancel"}
            </button>
          </div>
        ) : (
          <button
            onClick={handleDelete}
            className="text-[12px] text-red-500 hover:underline"
          >
            {locale === "mn" ? "Устгах" : "Delete"}
          </button>
        )}
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
