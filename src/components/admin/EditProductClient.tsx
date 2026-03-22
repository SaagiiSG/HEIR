"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import type { VariantDraft } from "@/components/admin/VariantManager";
import type { UploadedImage } from "@/components/admin/ImageUploader";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { deleteProduct, saveProduct } from "@/lib/actions/products";

interface EditProductClientProps {
  locale: string;
  productId: string;
  initialData: Parameters<typeof ProductForm>[0]["initialData"];
  categories: { id: string; slug: string; name_mn: string; name_en: string }[];
}

export function EditProductClient({ locale, productId, initialData, categories }: EditProductClientProps) {
  const router = useRouter();
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
