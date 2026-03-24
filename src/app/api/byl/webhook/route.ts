import { NextResponse, type NextRequest } from "next/server";
import { verifyBylSignature } from "@/lib/byl";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("Byl-Signature") ?? "";

  if (process.env.BYL_WEBHOOK_SECRET) {
    try {
      if (!verifyBylSignature(payload, signature)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  } else {
    console.warn("[byl/webhook] BYL_WEBHOOK_SECRET not set — skipping signature verification");
  }

  const event = JSON.parse(payload);

  if (event.type === "invoice.paid") {
    const invoice = event.data?.object;
    if (!invoice?.id) {
      return NextResponse.json({ received: true });
    }

    try {
      const supabase = createAdminClient();
      const invoiceId = String(invoice.id);

      // Find the linked order first
      const { data: payment } = await supabase
        .from("payments")
        .select("order_id")
        .eq("provider_invoice_id", invoiceId)
        .single();

      if (payment?.order_id) {
        await Promise.all([
          supabase
            .from("payments")
            .update({ status: "paid", paid_at: new Date().toISOString() })
            .eq("provider_invoice_id", invoiceId),
          supabase
            .from("orders")
            .update({ status: "paid" })
            .eq("id", payment.order_id)
            .eq("status", "pending"),
        ]);
      }
    } catch (err) {
      console.error("Byl webhook DB error:", err);
      // Return 200 so Byl doesn't retry for non-transient errors
    }
  }

  return NextResponse.json({ received: true });
}
