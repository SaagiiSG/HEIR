"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SyncPaymentsButton({ locale }: { locale: string }) {
  const isMn = locale === "mn";
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  async function sync() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/sync-payments", { method: "POST" });
      const data = await res.json();
      if (data.reconciled > 0) {
        setResult(isMn ? `${data.reconciled} захиалга шинэчлэгдлээ` : `${data.reconciled} order(s) marked paid`);
        router.refresh();
      } else {
        setResult(isMn ? "Шинэчлэх зүйл алга" : "Nothing to sync");
      }
    } catch {
      setResult(isMn ? "Алдаа гарлаа" : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={sync}
        disabled={loading}
        className="text-[11px] border border-gray-300 px-3 py-1.5 hover:border-black transition-colors disabled:opacity-50"
      >
        {loading ? "…" : isMn ? "Төлбөр синк" : "Sync Payments"}
      </button>
      {result && <span className="text-[11px] text-gray-500">{result}</span>}
    </div>
  );
}
