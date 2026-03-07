import { NextResponse, type NextRequest } from "next/server";
import { getBylInvoice } from "@/lib/byl";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const invoice = await getBylInvoice(id);

    return NextResponse.json({
      paid: invoice.status === "paid",
      status: invoice.status,
      invoice_id: invoice.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
