import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBylInvoice } from "@/lib/byl";

// Called by Vercel Cron every 5 minutes.
// Finds all pending orders that have a BYL invoice and checks if they've been paid.
export async function GET(request: NextRequest) {
  // Protect the cron endpoint — Vercel sets this header automatically
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Find pending orders that have a BYL payment row
  const { data: pendingPayments, error } = await supabase
    .from("payments")
    .select("order_id, provider_invoice_id")
    .eq("status", "pending")
    .eq("provider", "byl")
    .not("provider_invoice_id", "is", null);

  if (error) {
    console.error("[reconcile] DB fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!pendingPayments || pendingPayments.length === 0) {
    return NextResponse.json({ reconciled: 0 });
  }

  let reconciled = 0;
  const results: { orderId: string; status: string }[] = [];

  for (const row of pendingPayments) {
    try {
      const invoice = await getBylInvoice(row.provider_invoice_id);

      if (invoice.status === "paid") {
        await Promise.all([
          supabase
            .from("orders")
            .update({ status: "paid" })
            .eq("id", row.order_id)
            .eq("status", "pending"),
          supabase
            .from("payments")
            .update({ status: "paid", paid_at: new Date().toISOString() })
            .eq("order_id", row.order_id),
        ]);
        reconciled++;
        results.push({ orderId: row.order_id, status: "marked_paid" });
      } else {
        results.push({ orderId: row.order_id, status: invoice.status });
      }
    } catch (err) {
      console.error(`[reconcile] Error checking invoice for order ${row.order_id}:`, err);
      results.push({ orderId: row.order_id, status: "error" });
    }
  }

  console.log(`[reconcile] Done. Reconciled ${reconciled}/${pendingPayments.length} orders.`);
  return NextResponse.json({ reconciled, total: pendingPayments.length, results });
}
