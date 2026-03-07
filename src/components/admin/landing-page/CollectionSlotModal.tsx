"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search, Check } from "lucide-react";
import type { CollectionSlot } from "@/lib/landing-page-types";
import { slugify } from "@/lib/landing-page-types";
import { ImageUploadField } from "./ImageUploadField";

interface PickerProduct {
  id: string;
  slug: string;
  name_en: string;
  name_mn: string;
  base_price: number;
  primaryImageUrl: string;
  colorSwatches: string[];
}

interface CollectionSlotModalProps {
  slotIndex: number;
  slot: CollectionSlot;
  onSave: (index: number, slot: CollectionSlot) => void;
  onClose: () => void;
}

export function CollectionSlotModal({ slotIndex, slot, onSave, onClose }: CollectionSlotModalProps) {
  const [draft, setDraft] = useState<CollectionSlot>({ ...slot });
  const [products, setProducts] = useState<PickerProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedIds = new Set(draft.productIds);

  function fetchProducts(q: string) {
    setLoading(true);
    const params = new URLSearchParams({ q, limit: "50" });
    fetch(`/api/admin/landing-page/products?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    fetchProducts("");
  }, []);

  function handleSearch(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchProducts(value), 300);
  }

  function toggleProduct(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setDraft({ ...draft, productIds: Array.from(next) });
  }

  function updateLabel(field: "label_en" | "label_mn", value: string) {
    if (field === "label_en") {
      setDraft({ ...draft, label_en: value, slug: slugify(value) });
    } else {
      setDraft({ ...draft, label_mn: value });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-[920px] max-h-[88vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <p className="text-[13px] font-medium">Edit Collection — Slot {slotIndex + 1}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Upload a tile photo, set the label, then select which products appear in this collection.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* Left panel: tile settings */}
          <div className="w-[280px] shrink-0 border-r border-gray-100 overflow-y-auto p-5 space-y-5">
            <ImageUploadField
              label="Tile Photo"
              value={draft.imageUrl}
              onChange={(url) => setDraft({ ...draft, imageUrl: url })}
              aspect="aspect-square"
            />

            <div>
              <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">
                Label (English)
              </label>
              <input
                type="text"
                value={draft.label_en}
                onChange={(e) => updateLabel("label_en", e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-[12px] outline-none focus:border-black transition-colors"
                placeholder="e.g. Mongolian Cashmere"
              />
              {draft.slug && (
                <p className="text-[10px] text-gray-400 mt-1 font-mono">/{draft.slug}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">
                Label (Монгол)
              </label>
              <input
                type="text"
                value={draft.label_mn}
                onChange={(e) => updateLabel("label_mn", e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-[12px] outline-none focus:border-black transition-colors"
                placeholder="e.g. Монгол Кашмир"
              />
            </div>

            {selectedIds.size > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">
                  Selected ({selectedIds.size})
                </p>
                <p className="text-[10px] text-gray-400 leading-[1.6]">
                  {Array.from(selectedIds).length} product{selectedIds.size !== 1 ? "s" : ""} will appear on this collection page.
                </p>
              </div>
            )}
          </div>

          {/* Right panel: product grid */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search bar */}
            <div className="px-4 py-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2 border border-gray-200 px-3 py-2">
                <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="flex-1 text-[12px] outline-none bg-transparent placeholder-gray-400"
                  autoFocus
                />
                {query && (
                  <button
                    onClick={() => { setQuery(""); fetchProducts(""); }}
                    className="text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>

            {/* Product grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <p className="text-[12px] text-gray-400">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="flex items-center justify-center h-40">
                  <p className="text-[12px] text-gray-400">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {products.map((product) => {
                    const selected = selectedIds.has(product.id);
                    return (
                      <button
                        key={product.id}
                        onClick={() => toggleProduct(product.id)}
                        className={`relative text-left p-2 transition-all ${
                          selected
                            ? "ring-1 ring-black bg-gray-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="aspect-square bg-[#f5f5f5] mb-2 overflow-hidden relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.primaryImageUrl}
                            alt={product.name_en}
                            className="w-full h-full object-cover"
                          />
                          {selected && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-black rounded-full flex items-center justify-center shadow-sm">
                              <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] leading-[1.4] line-clamp-2 mb-0.5">
                          {product.name_en}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          ₮{product.base_price.toLocaleString()}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 shrink-0">
          <p className="text-[11px] text-gray-400">
            {selectedIds.size} product{selectedIds.size !== 1 ? "s" : ""} selected for this collection
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[12px] border border-gray-200 hover:border-black transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { onSave(slotIndex, draft); onClose(); }}
              className="px-4 py-2 text-[12px] bg-black text-white hover:bg-gray-800 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
