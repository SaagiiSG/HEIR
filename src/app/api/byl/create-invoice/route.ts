import { NextResponse, type NextRequest } from "next/server";
import { createBylInvoice } from "@/lib/byl";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { amount, description, orderId } = body;

  if (!amount || typeof amount !== "number") {
    return NextResponse.json({ error: "amount is required" }, { status: 400 });
  }

  try {
    const invoice = await createBylInvoice({ amount, description });

    // If orderId provided, persist the payment row so the webhook can link back
    if (orderId) {
      const supabase = createAdminClient();
      await supabase.from("payments").insert({
        order_id: orderId,
        provider: "byl",
        provider_invoice_id: String(invoice.id),
        amount,
        status: "pending",
      });
      // Mark order with a 5-minute expiry — admin panel filters these out once elapsed
      await supabase
        .from("orders")
        .update({ expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() })
        .eq("id", orderId);
    }

    return NextResponse.json({
      invoice_id: invoice.id,
      url: invoice.url,
      status: invoice.status,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
