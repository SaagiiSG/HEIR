import { StatsCard } from "@/components/admin/StatsCard";
import { OrderTable, type OrderRow } from "@/components/admin/OrderTable";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { ShoppingCart, Users, Package, TrendingUp } from "lucide-react";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

interface AdminDashboardProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminDashboard({ params }: AdminDashboardProps) {
  const { locale } = await params;
  const isMn = locale === "mn";

  let ordersToday = 0;
  let monthlyRevenue = 0;
  let totalCustomers = 0;
  let lowStockCount = 0;
  let recentOrders: OrderRow[] = [];

  type DataPoint = { label: string; value: number };
  let dailyData:   DataPoint[] = [];
  let weeklyData:  DataPoint[] = [];
  let monthlyData: DataPoint[] = [];

  // Order matches getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const dayLabels = isMn
    ? ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const now = new Date();

  // ── date boundaries ──────────────────────────────────────
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now);
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // ── skeleton maps ─────────────────────────────────────────
  // Daily: 24 hours
  const hourMap: Record<number, number> = {};
  for (let h = 0; h < 24; h++) hourMap[h] = 0;

  // Weekly: last 7 days
  const weekMap: Record<string, number> = {};
  const weekMeta: { dateStr: string; label: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    weekMeta.push({ dateStr, label: dayLabels[d.getDay()] });
    weekMap[dateStr] = 0;
  }

  // Monthly: last 30 days
  const monthMap: Record<string, number> = {};
  const monthMeta: { dateStr: string; label: string }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    monthMeta.push({ dateStr, label });
    monthMap[dateStr] = 0;
  }

  try {
    const supabase = createAdminClient();

    const [
      ordersTodayRes,
      monthlyOrdersRes,
      customerCountRes,
      lowStockRes,
      recentOrdersRes,
      dailyOrdersRes,
      weeklyOrdersRes,
      monthlyOrdersChartRes,
    ] = await Promise.all([
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "paid")
        .gte("created_at", todayStart.toISOString()),

      supabase
        .from("orders")
        .select("total")
        .eq("status", "paid")
        .gte("created_at", monthStart.toISOString()),

      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("product_variants")
        .select("id", { count: "exact", head: true })
        .lte("stock", 5)
        .gt("stock", 0),

      supabase
        .from("orders")
        .select("id, created_at, status, total, shipping_first_name, shipping_last_name")
        .eq("status", "paid")
        .order("created_at", { ascending: false })
        .limit(5),

      // Daily: today's paid orders
      supabase
        .from("orders")
        .select("created_at, total")
        .eq("status", "paid")
        .gte("created_at", todayStart.toISOString()),

      // Weekly: last 7 days
      supabase
        .from("orders")
        .select("created_at, total")
        .eq("status", "paid")
        .gte("created_at", sevenDaysAgo.toISOString()),

      // Monthly: last 30 days
      supabase
        .from("orders")
        .select("created_at, total")
        .eq("status", "paid")
        .gte("created_at", thirtyDaysAgo.toISOString()),
    ]);

    ordersToday   = ordersTodayRes.count ?? 0;
    monthlyRevenue = (monthlyOrdersRes.data ?? []).reduce((s, o) => s + (o.total ?? 0), 0);
    totalCustomers = customerCountRes.count ?? 0;
    lowStockCount  = lowStockRes.count ?? 0;

    recentOrders = (recentOrdersRes.data ?? []).map((o) => ({
      id: o.id,
      created_at: o.created_at,
      status: o.status,
      total: o.total,
      customer_name: [o.shipping_first_name, o.shipping_last_name].filter(Boolean).join(" ") || undefined,
    }));

    // Aggregate daily by hour
    (dailyOrdersRes.data ?? []).forEach((o) => {
      const hour = new Date(o.created_at).getHours();
      hourMap[hour] += o.total ?? 0;
    });

    // Aggregate weekly by date
    (weeklyOrdersRes.data ?? []).forEach((o) => {
      const day = o.created_at.slice(0, 10);
      if (day in weekMap) weekMap[day] += o.total ?? 0;
    });

    // Aggregate monthly by date
    (monthlyOrdersChartRes.data ?? []).forEach((o) => {
      const day = o.created_at.slice(0, 10);
      if (day in monthMap) monthMap[day] += o.total ?? 0;
    });

  } catch {
    // Service role key not configured
  }

  dailyData  = Object.entries(hourMap).map(([h, v]) => ({
    label: `${h}:00`,
    value: v,
  }));

  weeklyData  = weekMeta.map(({ dateStr, label }) => ({ label, value: weekMap[dateStr] ?? 0 }));
  monthlyData = monthMeta.map(({ dateStr, label }) => ({ label, value: monthMap[dateStr] ?? 0 }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-normal">
          {isMn ? "Удирдлагын самбар" : "Dashboard"}
        </h1>
        <p className="text-[11px] text-gray-400">
          {now.toLocaleDateString(isMn ? "mn-MN" : "en-US", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard
          title={isMn ? "Өнөөдрийн захиалга" : "Orders Today"}
          value={ordersToday}
          icon={ShoppingCart}
        />
        <StatsCard
          title={isMn ? "Энэ сарын орлого" : "Monthly Revenue"}
          value={`₮${monthlyRevenue.toLocaleString()}`}
          icon={TrendingUp}
        />
        <StatsCard
          title={isMn ? "Нийт хэрэглэгч" : "Total Customers"}
          value={totalCustomers}
          icon={Users}
        />
        <StatsCard
          title={isMn ? "Бага үлдэгдэлтэй" : "Low Stock Items"}
          value={lowStockCount}
          icon={Package}
          subtitle={isMn ? "≤5 үлдсэн" : "≤5 units left"}
        />
      </div>

      {/* Chart + recent orders */}
      <div className="grid grid-cols-[1fr_400px] gap-6">
        <RevenueChart
          daily={dailyData}
          weekly={weeklyData}
          monthly={monthlyData}
          locale={locale}
        />

        <div className="border border-gray-100 p-5 bg-white">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">
              {isMn ? "Сүүлийн захиалгууд" : "Recent Orders"}
            </p>
            <Link href={`/${locale}/admin/orders`} className="text-[11px] hover:underline">
              {isMn ? "Бүгдийг харах" : "View all"}
            </Link>
          </div>
          <OrderTable orders={recentOrders} locale={locale} />
        </div>
      </div>
    </div>
  );
}
