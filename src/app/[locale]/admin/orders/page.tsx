import { OrderTable, type OrderRow } from "@/components/admin/OrderTable";
import { OrdersKanban } from "@/components/admin/OrdersKanban";
import { OrderViewToggle } from "@/components/admin/OrderViewToggle";
import { SyncPaymentsButton } from "@/components/admin/SyncPaymentsButton";
import { createAdminClient } from "@/lib/supabase/admin";

interface AdminOrdersPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; view?: string }>;
}

// "active" = all non-pending orders (default view — hides abandoned/duplicate pending orders)
const STATUS_FILTERS = ["active", "pending", "paid", "processing", "shipped", "delivered", "cancelled"];

const KANBAN_STATUSES = ["pending", "paid", "processing", "shipped", "delivered"] as const;

export default async function AdminOrdersPage({ params, searchParams }: AdminOrdersPageProps) {
  const { locale } = await params;
  const { status = "active", view } = await searchParams;
  const isKanban = view === "kanban";

  let orders: OrderRow[] = [];

  try {
    const supabase = createAdminClient();

    let query = supabase
      .from("orders")
      .select("id, created_at, status, total, shipping_first_name, shipping_last_name, shipping_phone, shipping_address1, shipping_address2, shipping_district, shipping_city, shipping_postal_code")
      .order("created_at", { ascending: false });

    if (isKanban) {
      query = query.in("status", [...KANBAN_STATUSES]).limit(500);
    } else {
      query = query.limit(200);
      if (status === "active") {
        // Default: everything except pending (hides abandoned checkouts & double-click duplicates)
        query = query.neq("status", "pending");
      } else if (status !== "all") {
        query = query.eq("status", status);
      }
    }

    const { data } = await query;

    orders = (data ?? []).map((o) => {
      const addressParts = [
        o.shipping_address1,
        o.shipping_address2,
        o.shipping_district,
        o.shipping_city,
        o.shipping_postal_code,
      ].filter(Boolean);
      return {
        id: o.id,
        created_at: o.created_at,
        status: o.status,
        total: o.total,
        customer_name: [o.shipping_first_name, o.shipping_last_name].filter(Boolean).join(" ") || undefined,
        phone: o.shipping_phone ?? undefined,
        address: addressParts.length > 0 ? addressParts.join(", ") : undefined,
      };
    });
  } catch {
    // Service role key not configured
  }

  const STATUS_LABELS_MN: Record<string, string> = {
    active: "Идэвхтэй",
    all: "Бүгд",
    pending: "Хүлээгдэж байна",
    paid: "Төлөгдсөн",
    processing: "Бэлтгэж байна",
    shipped: "Хүргэлтэд",
    delivered: "Хүргэгдсэн",
    cancelled: "Цуцлагдсан",
  };

  const STATUS_LABELS_EN: Record<string, string> = {
    active: "Active",
    all: "All",
    pending: "Pending",
    paid: "Paid",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[20px] font-normal">
          {locale === "mn" ? "Захиалгууд" : "Orders"} ({orders.length})
        </h1>
        <div className="flex items-center gap-3">
          <SyncPaymentsButton locale={locale} />
          <OrderViewToggle currentView={view ?? "table"} />
        </div>
      </div>

      {/* Status filter tabs — hidden in kanban view */}
      {!isKanban && (
        <div className="flex gap-1 border-b border-gray-200">
          {STATUS_FILTERS.map((s) => (
            <a
              key={s}
              href={`/${locale}/admin/orders${s === "active" ? "" : `?status=${s}`}`}
              className={`px-4 py-2 text-[12px] border-b-2 transition-colors ${
                status === s
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-black"
              }`}
            >
              {locale === "mn" ? STATUS_LABELS_MN[s] : STATUS_LABELS_EN[s]}
            </a>
          ))}
        </div>
      )}

      {isKanban ? (
        <OrdersKanban orders={orders} locale={locale} />
      ) : (
        <div className="bg-white border border-gray-100 p-6">
          <OrderTable orders={orders} locale={locale} />
        </div>
      )}
    </div>
  );
}
