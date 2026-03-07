import { NextResponse, type NextRequest } from "next/server";
import { sendOrderConfirmation } from "@/lib/email";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

export async function POST(request: NextRequest) {
  // Verify the request comes from an internal server action
  const authHeader = request.headers.get("x-internal-secret");
  if (!INTERNAL_SECRET || authHeader !== INTERNAL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { to, name, orderId, items, total, locale = "mn" } = body;

    if (!to || !orderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

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
