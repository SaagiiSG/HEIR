"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface VariantImageUploadProps {
  images: string[];
  onChange: (urls: string[]) => void;
}

export function VariantImageUpload({ images, onChange }: VariantImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const ext = file.name.split(".").pop() ?? "jpg";
        const randomId = Math.random().toString(36).slice(2, 9);
        const path = `products/${Date.now()}-${randomId}.${ext}`;
        const { error } = await supabase.storage
          .from("product-images")
          .upload(path, file, { upsert: false });
        if (error) {
          newUrls.push(URL.createObjectURL(file));
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from("product-images")
            .getPublicUrl(path);
          newUrls.push(publicUrl);
        }
      }
      onChange([...images, ...newUrls].slice(0, 4));
    } finally {
      setUploading(false);
    }
  }

  function remove(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] uppercase tracking-wide text-gray-400">Color Images</p>
      <div className="flex flex-wrap gap-2 items-center">
        {images.map((url, i) => (
          <div key={i} className="relative group w-16 h-20 bg-gray-100 overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-0.5 right-0.5 bg-black/60 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-2.5 h-2.5" strokeWidth={2} />
            </button>
          </div>
        ))}
        {images.length < 4 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-16 h-20 border border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-black transition-colors disabled:opacity-50 shrink-0"
          >
            <ImagePlus className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
            <span className="text-[9px] text-gray-400">{uploading ? "..." : "Add"}</span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}
