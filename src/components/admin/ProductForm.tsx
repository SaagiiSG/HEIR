"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { VariantManager, type VariantDraft } from "./VariantManager";
import { ImageUploader, type UploadedImage } from "./ImageUploader";

interface ProductFormData {
  name_mn: string;
  name_en: string;
  description_mn: string;
  description_en: string;
  base_price: number;
  compare_at_price: number | null;
  category_id: string;
  is_active: boolean;
  is_featured: boolean;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData & {
    variants: VariantDraft[];
    images: UploadedImage[];
  }>;
  categories: { id: string; name_mn: string; name_en: string }[];
  onSubmit: (data: ProductFormData & {
    variants: VariantDraft[];
    images: UploadedImage[];
  }) => Promise<void>;
  locale?: string;
}

export function ProductForm({ initialData, categories, onSubmit, locale = "mn" }: ProductFormProps) {
  const [variants, setVariants] = useState<VariantDraft[]>(initialData?.variants ?? []);
  const [images, setImages] = useState<UploadedImage[]>(initialData?.images ?? []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    defaultValues: {
      name_mn: initialData?.name_mn ?? "",
      name_en: initialData?.name_en ?? "",
      description_mn: initialData?.description_mn ?? "",
      description_en: initialData?.description_en ?? "",
      base_price: initialData?.base_price ?? 0,
      compare_at_price: initialData?.compare_at_price ?? null,
      category_id: initialData?.category_id ?? "",
      is_active: initialData?.is_active ?? true,
      is_featured: initialData?.is_featured ?? false,
    },
  });

  async function onFormSubmit(data: ProductFormData) {
    await onSubmit({ ...data, variants, images });
  }

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: locale === "mn" ? c.name_mn : c.name_en,
  }));

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* Basic info */}
      <div className="space-y-4">
        <h3 className="text-[11px] uppercase tracking-wide text-gray-500">
          {locale === "mn" ? "Үндсэн мэдээлэл" : "Basic Info"}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Нэр (Монгол)"
            error={errors.name_mn?.message}
            {...register("name_mn", { required: "Заавал бөглөнө үү" })}
          />
          <Input
            label="Name (English)"
            error={errors.name_en?.message}
            {...register("name_en", { required: "Required" })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] uppercase tracking-wide">Тайлбар (МН)</label>
            <textarea
              className="border border-gray-300 px-3 py-2.5 text-[13px] outline-none focus:border-black transition-colors resize-none h-24"
              {...register("description_mn")}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] uppercase tracking-wide">Description (EN)</label>
            <textarea
              className="border border-gray-300 px-3 py-2.5 text-[13px] outline-none focus:border-black transition-colors resize-none h-24"
              {...register("description_en")}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Үнэ — бодит (₮)"
              type="number"
              min="0"
              error={errors.base_price?.message}
              {...register("base_price", { required: "Заавал бөглөнө үү", valueAsNumber: true })}
            />
            <p className="text-[10px] text-gray-400 mt-1">Хэрэглэгч төлөх үнэ</p>
          </div>
          <div>
            <Input
              label="Үнэ — өсгөсөн (₮)"
              type="number"
              min="0"
              {...register("compare_at_price", { setValueAs: (v) => v === "" || isNaN(Number(v)) ? null : Number(v) })}
            />
            <p className="text-[10px] text-gray-400 mt-1">Дэлгэцэнд үсрэгдэж харагдах үнэ</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Категори"
            options={categoryOptions}
            placeholder="Категори сонгох"
            {...register("category_id")}
          />
          <div className="flex flex-col gap-3 justify-end pb-1">
            <label className="flex items-center gap-2 text-[12px] cursor-pointer">
              <input type="checkbox" className="w-4 h-4" {...register("is_active")} />
              {locale === "mn" ? "Идэвхтэй" : "Active"}
            </label>
            <label className="flex items-center gap-2 text-[12px] cursor-pointer">
              <input type="checkbox" className="w-4 h-4" {...register("is_featured")} />
              {locale === "mn" ? "Онцлогдсон" : "Featured"}
            </label>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="border-t border-gray-100 pt-6">
        <ImageUploader images={images} onChange={setImages} />
      </div>

      {/* Variants */}
      <div className="border-t border-gray-100 pt-6">
        <VariantManager variants={variants} onChange={setVariants} />
      </div>

      <div className="border-t border-gray-100 pt-6 flex gap-3">
        <Button variant="solid" size="lg" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "..." : locale === "mn" ? "Хадгалах" : "Save Product"}
        </Button>
      </div>
    </form>
  );
}
