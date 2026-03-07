import { NextResponse, type NextRequest } from "next/server";
import { createBylInvoice } from "@/lib/byl";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { amount, description } = body;

  if (!amount || typeof amount !== "number") {
    return NextResponse.json({ error: "amount is required" }, { status: 400 });
  }

  try {
    const invoice = await createBylInvoice({ amount, description });

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
