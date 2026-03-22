"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface ProductFiltersProps {
  locale: string;
}

const CATEGORIES = [
  { value: "", label_mn: "БҮГД", label_en: "ALL" },
  { value: "jackets", label_mn: "ЖАКЕТ", label_en: "JACKET" },
  { value: "pants", label_mn: "ӨМД", label_en: "PANTS" },
  { value: "shirts", label_mn: "ЦАМЦ", label_en: "SHIRT" },
  { value: "coats", label_mn: "ПАЛЬТО", label_en: "COAT" },
  { value: "sweater", label_mn: "СВАЙТЕР", label_en: "SWEATER" },
  { value: "shoes", label_mn: "ГУТАЛ", label_en: "SHOES" },
  { value: "accessories", label_mn: "ДАГАЛДАХ", label_en: "ACCESS." },
];

export function ProductFilters({ locale }: ProductFiltersProps) {
  const isMn = locale === "mn";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") ?? "";

  function update(params: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    }
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-gray-200 pb-6">
      {/* Category pills */}
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => update({ category: cat.value })}
            className={`text-[12px] md:text-[10px] tracking-[0.25em] transition-colors ${
              currentCategory === cat.value
                ? "text-black"
                : "text-gray-400 hover:text-black"
            }`}
          >
            {isMn ? cat.label_mn : cat.label_en}
          </button>
        ))}
      </div>
    </div>
  );
}
