import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getBylInvoice } from "@/lib/byl";

export async function POST(request: NextRequest) {
  // Verify caller is an admin
  const serverClient = await createClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { orderId } = await request.json();
  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  // Find the BYL invoice for this order
  const { data: payment } = await supabase
    .from("payments")
    .select("provider_invoice_id")
    .eq("order_id", orderId)
    .eq("provider", "byl")
    .single();

  if (!payment?.provider_invoice_id) {
    return NextResponse.json({ markedPaid: false, reason: "no_invoice" });
  }

  try {
    const invoice = await getBylInvoice(payment.provider_invoice_id);

    if (invoice.status === "paid") {
      await Promise.all([
        supabase
          .from("orders")
          .update({ status: "paid" })
          .eq("id", orderId)
          .eq("status", "pending"),
        supabase
          .from("payments")
          .update({ status: "paid", paid_at: new Date().toISOString() })
          .eq("order_id", orderId),
      ]);
      return NextResponse.json({ markedPaid: true });
    }

    return NextResponse.json({ markedPaid: false, bylStatus: invoice.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
