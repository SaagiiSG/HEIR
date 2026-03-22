"use client";

import { useFormStatus } from "react-dom";
import { Trash2, Loader2 } from "lucide-react";

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="p-1.5 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-40"
      title="Delete product"
    >
      {pending
        ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" strokeWidth={1.5} />
        : <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
      }
    </button>
  );
}

interface DeleteProductFormProps {
  action: () => Promise<void>;
}

export function DeleteProductForm({ action }: DeleteProductFormProps) {
  return (
    <form action={action}>
      <DeleteButton />
    </form>
  );
}
