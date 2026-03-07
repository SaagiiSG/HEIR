import { CustomerTable, type CustomerRow } from "@/components/admin/CustomerTable";
import { createAdminClient } from "@/lib/supabase/admin";

interface AdminCustomersPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminCustomersPage({ params }: AdminCustomersPageProps) {
  const { locale } = await params;

  let customers: CustomerRow[] = [];

  try {
    const supabase = createAdminClient();

    // Fetch all profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, ner, ovog, created_at")
      .order("created_at", { ascending: false });

    if (profiles && profiles.length > 0) {
      // Fetch order totals per user
      const { data: orderAgg } = await supabase
        .from("orders")
        .select("user_id, total, status")
        .not("status", "in", "(cancelled,refunded)");

      // Aggregate orders per user
      const ordersByUser: Record<string, { count: number; total: number }> = {};
      (orderAgg ?? []).forEach((o) => {
        if (!o.user_id) return;
        if (!ordersByUser[o.user_id]) ordersByUser[o.user_id] = { count: 0, total: 0 };
        ordersByUser[o.user_id].count += 1;
        ordersByUser[o.user_id].total += o.total ?? 0;
      });

      // Get emails from auth.admin
      const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const emailMap: Record<string, string> = {};
      (authData?.users ?? []).forEach((u) => {
        if (u.email) emailMap[u.id] = u.email;
      });

      customers = profiles.map((p) => ({
        id: p.id,
        ovog: p.ovog ?? p.last_name ?? undefined,
        ner: p.ner ?? p.first_name ?? undefined,
        email: emailMap[p.id],
        created_at: p.created_at,
        order_count: ordersByUser[p.id]?.count ?? 0,
        total_spent: ordersByUser[p.id]?.total ?? 0,
      }));
    }
  } catch {
    // Service role key not configured
  }

  return (
    <div className="space-y-6">
      <h1 className="text-[20px] font-normal">
        {locale === "mn" ? "Хэрэглэгчид" : "Customers"} ({customers.length})
      </h1>

      <div className="bg-white border border-gray-100 p-6">
        <CustomerTable customers={customers} locale={locale} />
      </div>
    </div>
  );
}
