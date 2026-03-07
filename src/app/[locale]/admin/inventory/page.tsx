import { createAdminClient } from "@/lib/supabase/admin";
import { InventoryPageClient } from "@/components/admin/InventoryPageClient";
import type { InventoryRow } from "@/components/admin/InventoryTable";

interface AdminInventoryPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminInventoryPage({ params }: AdminInventoryPageProps) {
  const { locale } = await params;

  let rows: InventoryRow[] = [];

  try {
    const supabase = createAdminClient();

    // Fetch inventory joined with variant + product info
    const { data } = await supabase
      .from("inventory")
      .select(`
        variant_id,
        quantity,
        low_stock_threshold,
        product_variants!inner (
          sku,
          size,
          color,
          products!inner ( name_en, name_mn )
        )
      `)
      .order("quantity", { ascending: true });

    rows = (data ?? []).map((row) => {
      const variant = row.product_variants as unknown as {
        sku: string | null;
        size: string;
        color: string;
        products: { name_en: string; name_mn: string };
      };
      const productName = locale === "mn"
        ? variant.products.name_mn
        : variant.products.name_en;

      return {
        variant_id: row.variant_id,
        sku: variant.sku ?? undefined,
        product_name: productName,
        size: variant.size,
        color: variant.color,
        quantity: row.quantity,
        low_stock_threshold: row.low_stock_threshold ?? 3,
      };
    });
  } catch {
    // Service role key not configured
  }

  return <InventoryPageClient rows={rows} locale={locale} />;
}
