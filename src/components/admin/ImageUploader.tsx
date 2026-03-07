"use client";

import { useState, useRef } from "react";
import { Upload, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export interface UploadedImage {
  id?: string;
  url: string;
  is_primary: boolean;
  _storagePath?: string;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
}

export function ImageUploader({ images, onChange, maxImages = 8 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      const supabase = createClient();
      const newImages: UploadedImage[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;

        const ext = file.name.split(".").pop() ?? "jpg";
        const randomId = Math.random().toString(36).slice(2, 9);
        const path = `products/${Date.now()}-${randomId}.${ext}`;

        const { error } = await supabase.storage
          .from("product-images")
          .upload(path, file, { upsert: false });

        let url: string;
        if (error) {
          // Fallback to object URL if upload fails (e.g. bucket not configured yet)
          console.warn("Storage upload failed, using preview URL:", error.message);
          url = URL.createObjectURL(file);
          newImages.push({ url, is_primary: images.length === 0 && newImages.length === 0 });
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from("product-images")
            .getPublicUrl(path);
          url = publicUrl;
          newImages.push({
            url,
            is_primary: images.length === 0 && newImages.length === 0,
            _storagePath: path,
          });
        }
      }

      onChange([...images, ...newImages].slice(0, maxImages));
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    const updated = images.filter((_, i) => i !== index);
    // Ensure first image is primary
    if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
      updated[0].is_primary = true;
    }
    onChange(updated);
  }

  function setPrimary(index: number) {
    onChange(images.map((img, i) => ({ ...img, is_primary: i === index })));
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] uppercase tracking-wide">
        Images ({images.length}/{maxImages})
      </p>

      {/* Upload zone */}
      {images.length < maxImages && (
        <div
          className={cn(
            "border-2 border-dashed border-gray-200 p-8 text-center cursor-pointer transition-colors",
            dragOver && "border-black bg-gray-50",
            uploading && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          <Upload className="w-6 h-6 mx-auto mb-2 text-gray-300" strokeWidth={1.5} />
          <p className="text-[12px] text-gray-400">
            {uploading ? "Uploading..." : "Click or drag images here"}
          </p>
          <p className="text-[11px] text-gray-300 mt-1">PNG, JPG up to 5MB each</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <div className={cn(
                "aspect-[3/4] bg-gray-100 overflow-hidden border-2 transition-colors",
                img.is_primary ? "border-black" : "border-transparent"
              )}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </div>

              {/* Controls overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!img.is_primary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(i)}
                    className="bg-white text-[10px] px-2 py-1 hover:bg-gray-100"
                  >
                    Primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="bg-white p-1 hover:bg-red-50"
                >
                  <X className="w-3 h-3" strokeWidth={1.5} />
                </button>
              </div>

              {img.is_primary && (
                <span className="absolute bottom-1 left-1 bg-black text-white text-[9px] px-1.5 py-0.5">
                  Primary
                </span>
              )}

              <GripVertical className="absolute top-1 right-1 w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100" strokeWidth={1.5} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
