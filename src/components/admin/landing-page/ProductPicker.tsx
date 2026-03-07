"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface PickerProduct {
  id: string;
  slug: string;
  name_en: string;
  name_mn: string;
  base_price: number;
  compare_at_price: number | null;
  primaryImageUrl: string;
  colorSwatches: string[];
}

interface ProductPickerProps {
  onSelect: (product: PickerProduct) => void;
  onClose: () => void;
}

export function ProductPicker({ onSelect, onClose }: ProductPickerProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<PickerProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function fetchProducts(q: string) {
    setLoading(true);
    const params = new URLSearchParams({ q, limit: "20" });
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-[640px] max-h-[80vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="text-[13px] font-medium">Select Product</p>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 border border-gray-200 px-3 py-2">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
            <input
              autoFocus
              type="text"
              placeholder="Search by name..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 text-[12px] outline-none bg-transparent placeholder-gray-400"
            />
          </div>
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-[12px] text-gray-400">Loading...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-[12px] text-gray-400">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => onSelect(product)}
                  className="group text-left hover:bg-gray-50 transition-colors p-2 -m-2 rounded"
                >
                  <div className="aspect-square bg-[#f5f5f5] mb-2 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.primaryImageUrl}
                      alt={product.name_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-[11px] leading-[1.4] mb-0.5 line-clamp-2">{product.name_en}</p>
                  <p className="text-[11px] text-gray-500">₮{product.base_price.toLocaleString()}</p>
                  {product.colorSwatches.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {product.colorSwatches.slice(0, 4).map((hex) => (
                        <span
                          key={hex}
                          className="w-2.5 h-2.5 rounded-full border border-gray-200"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
