"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspect?: string; // tailwind aspect ratio class e.g. "aspect-[4/5]" or "aspect-square"
  bucket?: string;
  pathPrefix?: string;
}

export function ImageUploadField({
  value,
  onChange,
  label,
  aspect = "aspect-square",
  bucket = "product-images",
  pathPrefix = "landing-page",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(publicUrl);
    } catch {
      // Fallback: local object URL so admin can still see it
      onChange(URL.createObjectURL(file));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {label && (
        <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">
          {label}
        </label>
      )}

      {/* Click-to-upload box */}
      <div
        className={`${aspect} bg-[#f5f5f5] relative overflow-hidden group cursor-pointer border border-dashed border-gray-300 hover:border-black transition-colors`}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
              <Upload className="w-5 h-5 text-white" strokeWidth={1.5} />
              <span className="text-[10px] text-white tracking-wide">Replace photo</span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Upload className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[11px]">Upload photo</span>
          </div>
        )}

        {/* Uploading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-[11px] text-gray-600">Uploading...</span>
          </div>
        )}
      </div>

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-400 hover:text-red-500 transition-colors"
        >
          <X className="w-3 h-3" strokeWidth={1.5} />
          Remove photo
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
