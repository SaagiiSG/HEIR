import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getBylInvoice } from "@/lib/byl";

// Admin-session-protected version of the cron reconcile endpoint.
// Called from the "Sync Payments" button on the admin orders page.
export async function POST() {
  const serverClient = await createClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: pendingPayments } = await supabase
    .from("payments")
    .select("order_id, provider_invoice_id")
    .eq("status", "pending")
    .eq("provider", "byl")
    .not("provider_invoice_id", "is", null);

  if (!pendingPayments?.length) return NextResponse.json({ reconciled: 0 });

  let reconciled = 0;
  for (const row of pendingPayments) {
    try {
      const invoice = await getBylInvoice(row.provider_invoice_id);
      if (invoice.status === "paid") {
        await Promise.all([
          supabase.from("orders").update({ status: "paid" }).eq("id", row.order_id).eq("status", "pending"),
          supabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("order_id", row.order_id),
        ]);
        reconciled++;
      }
    } catch {
      // skip — BYL might not have this invoice
    }
  }

  return NextResponse.json({ reconciled, total: pendingPayments.length });
}
