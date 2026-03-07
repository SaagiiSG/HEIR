"use client";

import Image from "next/image";
import { useCart, type CartItem as CartItemType } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { X, Plus, Minus } from "lucide-react";

interface CartItemProps {
  item: CartItemType;
  locale: string;
}

export function CartItem({ item, locale }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const name = locale === "mn" ? item.nameMn : item.name;

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100">
      {/* Image */}
      <div className="w-20 h-24 bg-[#f5f5f5] shrink-0 relative overflow-hidden">
        <Image
          src={item.image || "https://placehold.co/80x96/f5f5f5/f5f5f5"}
          alt={name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <p className="text-[12px] leading-[1.4] line-clamp-2">{name}</p>
          <button
            onClick={() => removeItem(item.id)}
            className="shrink-0 hover:opacity-60 transition-opacity mt-0.5"
          >
            <X className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-1 text-[11px] text-gray-500 space-y-0.5">
          {item.size && <p>{item.size}</p>}
          {item.color && <p>{item.color}</p>}
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-gray-200">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Minus className="w-3 h-3" strokeWidth={1.5} />
            </button>
            <span className="w-8 text-center text-[12px]">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-3 h-3" strokeWidth={1.5} />
            </button>
          </div>
          <p className="text-[12px]">
            {formatPrice(item.price * item.quantity, locale as "mn" | "en")}
          </p>
        </div>
      </div>
    </div>
  );
}
