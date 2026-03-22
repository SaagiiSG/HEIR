"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/lib/actions/products";

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm(`Delete "${productName}"?`)) return;
    setLoading(true);
    try {
      await deleteProduct(productId);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="p-1.5 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-40"
      title="Delete product"
    >
      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
    </button>
  );
}
