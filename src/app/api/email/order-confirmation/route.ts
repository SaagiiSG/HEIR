import { NextResponse, type NextRequest } from "next/server";
import { sendOrderConfirmation } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, name, orderId, items, total, locale = "mn" } = body;

    if (!to || !orderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // TODO: Verify this request is coming from an authenticated server action
    // (add a shared secret or verify Supabase service role)

    const result = await sendOrderConfirmation({ to, name, orderId, items, total, locale });

    return NextResponse.json({ success: true, id: result.data?.id });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
