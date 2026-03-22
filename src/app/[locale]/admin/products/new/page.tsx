"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import { createClient } from "@/lib/supabase/client";
import type { VariantDraft } from "@/components/admin/VariantManager";
import type { UploadedImage } from "@/components/admin/ImageUploader";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { createProduct } from "@/lib/actions/products";

export default function NewProductPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) ?? "mn";

  const [categories, setCategories] = useState<{ id: string; slug: string; name_mn: string; name_en: string }[]>([]);

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
    try {
      await createProduct(
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
      alert(err instanceof Error ? err.message : "Failed to create product");
    }
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
