"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";

interface SizeGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const SIZE_TABLE = [
  { size: "XS", chest: "86-90", waist: "70-74", hip: "90-94" },
  { size: "S", chest: "90-94", waist: "74-78", hip: "94-98" },
  { size: "M", chest: "94-98", waist: "78-82", hip: "98-102" },
  { size: "L", chest: "98-103", waist: "82-87", hip: "102-107" },
  { size: "XL", chest: "103-108", waist: "87-92", hip: "107-112" },
  { size: "XXL", chest: "108-114", waist: "92-98", hip: "112-118" },
];

export function SizeGuide({ isOpen, onClose }: SizeGuideProps) {
  const t = useTranslations("product");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white max-w-lg w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[15px] font-medium">{t("sizeGuide")}</h2>
          <button onClick={onClose} className="hover:opacity-60 transition-opacity">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left pb-3 font-normal uppercase tracking-wide text-[11px]">Size</th>
              <th className="text-left pb-3 font-normal uppercase tracking-wide text-[11px]">Chest (cm)</th>
              <th className="text-left pb-3 font-normal uppercase tracking-wide text-[11px]">Waist (cm)</th>
              <th className="text-left pb-3 font-normal uppercase tracking-wide text-[11px]">Hip (cm)</th>
            </tr>
          </thead>
          <tbody>
            {SIZE_TABLE.map((row) => (
              <tr key={row.size} className="border-b border-gray-100">
                <td className="py-2.5">{row.size}</td>
                <td className="py-2.5">{row.chest}</td>
                <td className="py-2.5">{row.waist}</td>
                <td className="py-2.5">{row.hip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
