"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";

type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "pending", label: "Хүлээгдэж байна" },
  { value: "paid", label: "Төлөгдсөн" },
  { value: "processing", label: "Захиалга бэлтгэж байна" },
  { value: "shipped", label: "Хүргэлтэд гарсан" },
  { value: "delivered", label: "Хүргэгдсэн" },
  { value: "cancelled", label: "Цуцлагдсан" },
  { value: "refunded", label: "Буцаасан" },
];

const STATUS_LABELS_MN: Record<string, string> = {
  pending: "Хүлээгдэж байна",
  paid: "Төлөгдсөн",
  processing: "Захиалга бэлтгэж байна",
  shipped: "Хүргэлтэд гарсан",
  delivered: "Хүргэгдсэн",
  cancelled: "Цуцлагдсан",
  refunded: "Буцаасан",
};

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
  locale: string;
}

export function OrderStatusUpdater({ orderId, currentStatus, locale }: OrderStatusUpdaterProps) {
  const isMn = locale === "mn";
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus as OrderStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function updateStatus() {
    if (status === currentStatus) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <div className="bg-white border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] uppercase tracking-wide text-gray-500">
          {isMn ? "Одоогийн төлөв" : "Current Status"}
        </p>
        <StatusBadge
          status={currentStatus as OrderStatus}
          label={STATUS_LABELS_MN[currentStatus] ?? currentStatus}
        />
      </div>

      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Select
            label={isMn ? "Шинэ төлөв" : "New Status"}
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as OrderStatus);
              setSaved(false);
            }}
          />
        </div>
        <Button
          variant="solid"
          size="md"
          onClick={updateStatus}
          disabled={saving || status === currentStatus}
        >
          {saving ? "..." : isMn ? "Хадгалах" : "Update"}
        </Button>
      </div>

      {error && (
        <p className="text-[12px] text-red-500 mt-2">{error}</p>
      )}
      {saved && (
        <p className="text-[12px] text-green-600 mt-2">
          {isMn ? "Амжилттай шинэчлэгдлээ" : "Status updated"}
        </p>
      )}
    </div>
  );
}
