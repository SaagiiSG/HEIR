import { StatsCard } from "@/components/admin/StatsCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { TrendingUp, ShoppingCart, Users, Package } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";

interface AdminAnalyticsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminAnalyticsPage({ params }: AdminAnalyticsPageProps) {
  const { locale } = await params;
  const isMn = locale === "mn";

  // Date boundaries
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Day labels for last 7 days
  const dayNames = isMn
    ? ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const last7DayKeys: { dateStr: string; label: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    last7DayKeys.push({
      dateStr: d.toISOString().slice(0, 10),
      label: dayNames[d.getDay()],
    });
  }

  // Defaults
  let thisMonthRevenue = 0;
  let lastMonthRevenue = 0;
  let thisMonthOrders = 0;
  let lastMonthOrders = 0;
  let newCustomers = 0;
  let avgOrderValue = 0;
  let last7DaysData: { label: string; value: number }[] = last7DayKeys.map(({ label }) => ({ label, value: 0 }));
  let last4WeeksData: { label: string; value: number }[] = Array.from({ length: 4 }, (_, i) => ({
    label: `${isMn ? "Долоо хоног" : "Week"} ${i + 1}`,
    value: 0,
  }));
  let topProducts: { name: string; revenue: number; units: number }[] = [];

  try {
    const supabase = createAdminClient();

    const [
      thisMonthRes,
      lastMonthRes,
      newCustomersRes,
      weekOrdersRes,
      monthOrdersRes,
      topProductsRes,
    ] = await Promise.all([
      // This month orders (non-cancelled)
      supabase
        .from("orders")
        .select("total")
        .gte("created_at", monthStart.toISOString())
        .not("status", "in", "(cancelled,refunded)"),

      // Last month orders (non-cancelled)
      supabase
        .from("orders")
        .select("total")
        .gte("created_at", lastMonthStart.toISOString())
        .lte("created_at", lastMonthEnd.toISOString())
        .not("status", "in", "(cancelled,refunded)"),

      // New customers this month
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", monthStart.toISOString()),

      // Last 7 days orders for daily chart
      supabase
        .from("orders")
        .select("created_at, total")
        .gte("created_at", sevenDaysAgo.toISOString())
        .not("status", "in", "(cancelled,refunded)"),

      // Last 30 days orders for weekly chart
      supabase
        .from("orders")
        .select("created_at, total")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .not("status", "in", "(cancelled,refunded)"),

      // Top products by revenue (all time, from non-cancelled orders)
      supabase
        .from("order_items")
        .select(`
          quantity,
          price,
          product_id,
          products!inner ( name_en, name_mn )
        `),
    ]);

    // This month stats
    const thisMonthData = thisMonthRes.data ?? [];
    thisMonthRevenue = thisMonthData.reduce((s, o) => s + (o.total ?? 0), 0);
    thisMonthOrders = thisMonthData.length;

    // Last month stats
    const lastMonthData = lastMonthRes.data ?? [];
    lastMonthRevenue = lastMonthData.reduce((s, o) => s + (o.total ?? 0), 0);
    lastMonthOrders = lastMonthData.length;

    newCustomers = newCustomersRes.count ?? 0;
    avgOrderValue = thisMonthOrders > 0 ? Math.round(thisMonthRevenue / thisMonthOrders) : 0;

    // 7-day chart
    const dayMap: Record<string, number> = {};
    last7DayKeys.forEach(({ dateStr }) => { dayMap[dateStr] = 0; });
    (weekOrdersRes.data ?? []).forEach((o) => {
      const day = o.created_at.slice(0, 10);
      if (day in dayMap) dayMap[day] += o.total ?? 0;
    });
    last7DaysData = last7DayKeys.map(({ dateStr, label }) => ({ label, value: dayMap[dateStr] ?? 0 }));

    // 4-week chart — group into 4 buckets (oldest to newest)
    const weekMap = [0, 0, 0, 0];
    (monthOrdersRes.data ?? []).forEach((o) => {
      const daysOld = Math.floor((now.getTime() - new Date(o.created_at).getTime()) / 86400000);
      const bucket = Math.min(3, Math.floor(daysOld / 7));
      // bucket 0 = most recent week, bucket 3 = oldest — reverse to show oldest first
      weekMap[3 - bucket] += o.total ?? 0;
    });
    last4WeeksData = weekMap.map((value, i) => ({
      label: `${isMn ? "Долоо хоног" : "Week"} ${i + 1}`,
      value,
    }));

    // Top products
    const productTotals: Record<string, { name: string; revenue: number; units: number }> = {};
    (topProductsRes.data ?? []).forEach((item) => {
      const product = item.products as unknown as { name_en: string; name_mn: string };
      const pid = item.product_id;
      if (!pid) return;
      if (!productTotals[pid]) {
        productTotals[pid] = {
          name: isMn ? product.name_mn : product.name_en,
          revenue: 0,
          units: 0,
        };
      }
      productTotals[pid].revenue += (item.price ?? 0) * (item.quantity ?? 1);
      productTotals[pid].units += item.quantity ?? 1;
    });
    topProducts = Object.values(productTotals)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

  } catch {
    // Service role key not configured
  }

  // Trend % vs last month
  const revenueTrend = lastMonthRevenue > 0
    ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : 0;
  const ordersTrend = lastMonthOrders > 0
    ? Math.round(((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <h1 className="text-[20px] font-normal">
        {isMn ? "Аналитик" : "Analytics"}
      </h1>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard
          title={isMn ? "Энэ сарын орлого" : "This Month Revenue"}
          value={`₮${thisMonthRevenue.toLocaleString()}`}
          icon={TrendingUp}
          trend={{ value: revenueTrend, label: isMn ? "өмнөх сараас" : "vs last month" }}
        />
        <StatsCard
          title={isMn ? "Захиалгын тоо" : "Total Orders"}
          value={thisMonthOrders}
          icon={ShoppingCart}
          trend={{ value: ordersTrend, label: isMn ? "өмнөх сараас" : "vs last month" }}
        />
        <StatsCard
          title={isMn ? "Шинэ хэрэглэгч" : "New Customers"}
          value={newCustomers}
          icon={Users}
        />
        <StatsCard
          title={isMn ? "Дундаж захиалга" : "Avg. Order Value"}
          value={`₮${avgOrderValue.toLocaleString()}`}
          icon={Package}
        />
      </div>

      {/* Revenue charts */}
      <div className="grid grid-cols-1 gap-6">
        <RevenueChart
          daily={[]}
          weekly={last7DaysData}
          monthly={last4WeeksData}
          locale={locale}
        />
      </div>

      {/* Top products */}
      {topProducts.length > 0 && (
        <div className="border border-gray-100 bg-white">
          <p className="text-[11px] uppercase tracking-wide text-gray-500 px-5 pt-5 pb-3">
            {isMn ? "Шилдэг бараа (нийт)" : "Top Products (All Time)"}
          </p>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2.5 px-5 font-normal text-[11px] text-gray-400">
                  {isMn ? "Бараа" : "Product"}
                </th>
                <th className="text-right py-2.5 px-5 font-normal text-[11px] text-gray-400">
                  {isMn ? "Тоо ширхэг" : "Units"}
                </th>
                <th className="text-right py-2.5 px-5 font-normal text-[11px] text-gray-400">
                  {isMn ? "Орлого" : "Revenue"}
                </th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-3 px-5">{p.name}</td>
                  <td className="py-3 px-5 text-right text-gray-500">{p.units}</td>
                  <td className="py-3 px-5 text-right">
                    {formatPrice(p.revenue, locale as "mn" | "en")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
