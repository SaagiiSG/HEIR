"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CheckBylPaymentButtonProps {
  orderId: string;
  isMn: boolean;
}

export function CheckBylPaymentButton({ orderId, isMn }: CheckBylPaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"paid" | "not_paid" | "error" | null>(null);
  const router = useRouter();

  async function check() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/check-byl-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.markedPaid) {
        setResult("paid");
        router.refresh();
      } else {
        setResult("not_paid");
      }
    } catch {
      setResult("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={check}
        disabled={loading}
        className="text-[11px] underline underline-offset-2 text-blue-600 hover:text-blue-800 disabled:opacity-50"
      >
        {loading
          ? (isMn ? "Шалгаж байна..." : "Checking...")
          : (isMn ? "BYL төлбөр шалгах" : "Check BYL payment")}
      </button>
      {result === "paid" && (
        <span className="text-[11px] text-green-600">
          {isMn ? "Төлбөр баталгаажлаа ✓" : "Payment confirmed ✓"}
        </span>
      )}
      {result === "not_paid" && (
        <span className="text-[11px] text-gray-400">
          {isMn ? "Төлбөр ороогүй байна" : "Not paid yet"}
        </span>
      )}
      {result === "error" && (
        <span className="text-[11px] text-red-500">
          {isMn ? "Алдаа гарлаа" : "Error checking"}
        </span>
      )}
    </div>
  );
}
