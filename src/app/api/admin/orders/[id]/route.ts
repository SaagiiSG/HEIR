import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const serverClient = await createClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      id, created_at, status, subtotal, shipping, total,
      shipping_first_name, shipping_last_name,
      shipping_phone, shipping_address1, shipping_address2,
      shipping_city, shipping_district, shipping_postal_code,
      notes, user_id,
      order_items (
        id, quantity, price,
        product_name_en, product_name_mn,
        size, color, image
      )
    `)
    .eq("id", id)
    .single();

  if (error || !order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(order);
}
