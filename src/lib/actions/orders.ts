"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendOrderConfirmation } from "@/lib/email";

export interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  nameMn: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image?: string;
}

export interface CreateOrderInput {
  phone: string;
  firstName: string;
  lastName: string;
  address1: string;
  district: string;
  city: string;
  postalCode?: string;
  locale?: string;
  items: OrderItem[];
  subtotal: number;
}

export async function createOrder(
  input: CreateOrderInput
): Promise<{ orderId?: string; error?: string }> {
  if (input.items.length === 0) {
    return { error: "Сагс хоосон байна" };
  }

  try {
    // Get current user (checkout route is protected so user is always present)
    const serverClient = await createClient();
    const { data: { user } } = await serverClient.auth.getUser();

    const supabase = createAdminClient();

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        status: "pending",
        subtotal: input.subtotal,
        shipping: 0,
        total: input.subtotal,
        shipping_first_name: input.firstName,
        shipping_last_name: input.lastName,
        shipping_phone: input.phone,
        shipping_address1: input.address1,
        shipping_district: input.district,
        shipping_city: input.city,
        shipping_postal_code: input.postalCode ?? null,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      return { error: orderError?.message ?? "Захиалга үүсгэж чадсангүй" };
    }

    // Insert order items
    const { error: itemsError } = await supabase.from("order_items").insert(
      input.items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId,
        product_name_en: item.name,
        product_name_mn: item.nameMn,
        size: item.size,
        color: item.color,
        price: item.price,
        quantity: item.quantity,
        image: item.image ?? null,
      }))
    );

    if (itemsError) {
      // Order was created — clean it up to avoid orphaned records
      await supabase.from("orders").delete().eq("id", order.id);
      return { error: itemsError.message };
    }

    // Decrement stock — tries atomic DB function (migration 013), falls back to
    // read-then-update if the function hasn't been deployed yet.
    for (const item of input.items) {
      const { error: rpcError } = await supabase.rpc("decrement_variant_stock", {
        p_variant_id: item.variantId,
        p_quantity: item.quantity,
      });
      if (rpcError) {
        // Fallback: read current stock then update (not atomic, acceptable for MVP)
        const { data: variant } = await supabase
          .from("product_variants")
          .select("stock")
          .eq("id", item.variantId)
          .single();
        if (variant) {
          await supabase
            .from("product_variants")
            .update({ stock: Math.max(0, (variant.stock ?? 0) - item.quantity) })
            .eq("id", item.variantId);
        }
      }
    }

    // Send order confirmation email — best-effort, never blocks order completion
    if (user?.email) {
      sendOrderConfirmation({
        to: user.email,
        name: `${input.firstName} ${input.lastName}`,
        orderId: order.id,
        items: input.items.map((item) => ({
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        })),
        total: input.subtotal,
        locale: (input.locale as "mn" | "en") ?? "mn",
      }).catch((e) => console.error("[email] Order confirmation failed:", e));
    }

    return { orderId: order.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Алдаа гарлаа" };
  }
}

export async function markOrderPaid(orderId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("orders")
    .update({ status: "paid" })
    .eq("id", orderId)
    .eq("status", "pending"); // no-op if webhook already updated it
  await supabase
    .from("payments")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("order_id", orderId)
    .eq("status", "pending");
}

export async function deleteExpiredOrder(orderId: string): Promise<void> {
  const supabase = createAdminClient();
  // Only deletes if still pending — guards against race with payment webhook
  await supabase
    .from("orders")
    .delete()
    .eq("id", orderId)
    .eq("status", "pending");
}

export type KanbanStatus = "pending" | "paid" | "processing" | "shipped" | "delivered";

export async function updateOrderStatus(
  orderId: string,
  newStatus: KanbanStatus
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);
  return error ? { error: error.message } : {};
}
