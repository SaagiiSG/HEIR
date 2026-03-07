"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface DropFormData {
  title_mn: string;
  title_en: string;
  description_mn: string;
  description_en: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

interface DropFormProps {
  initialData?: Partial<DropFormData>;
  onSubmit: (data: DropFormData) => Promise<void>;
  locale?: string;
}

export function DropForm({ initialData, onSubmit, locale = "mn" }: DropFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DropFormData>({
    defaultValues: {
      title_mn: initialData?.title_mn ?? "",
      title_en: initialData?.title_en ?? "",
      description_mn: initialData?.description_mn ?? "",
      description_en: initialData?.description_en ?? "",
      starts_at: initialData?.starts_at ?? "",
      ends_at: initialData?.ends_at ?? "",
      is_active: initialData?.is_active ?? false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Гарчиг (МН)"
          error={errors.title_mn?.message}
          {...register("title_mn", { required: "Заавал бөглөнө үү" })}
        />
        <Input
          label="Title (EN)"
          error={errors.title_en?.message}
          {...register("title_en", { required: "Required" })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] uppercase tracking-wide">Тайлбар (МН)</label>
          <textarea
            className="border border-gray-300 px-3 py-2.5 text-[13px] outline-none focus:border-black resize-none h-20"
            {...register("description_mn")}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] uppercase tracking-wide">Description (EN)</label>
          <textarea
            className="border border-gray-300 px-3 py-2.5 text-[13px] outline-none focus:border-black resize-none h-20"
            {...register("description_en")}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={locale === "mn" ? "Эхлэх огноо" : "Start Date"}
          type="datetime-local"
          error={errors.starts_at?.message}
          {...register("starts_at", { required: "Заавал бөглөнө үү" })}
        />
        <Input
          label={locale === "mn" ? "Дуусах огноо" : "End Date"}
          type="datetime-local"
          {...register("ends_at")}
        />
      </div>

      <label className="flex items-center gap-2 text-[12px] cursor-pointer">
        <input type="checkbox" className="w-4 h-4" {...register("is_active")} />
        {locale === "mn" ? "Идэвхтэй" : "Active"}
      </label>

      <Button variant="solid" size="lg" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "..." : locale === "mn" ? "Хадгалах" : "Save Drop"}
      </Button>
    </form>
  );
}
