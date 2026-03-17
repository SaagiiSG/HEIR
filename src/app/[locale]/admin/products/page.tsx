import Link from "next/link";
import { Plus } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { RestockDialog } from "@/components/admin/RestockDialog";

interface ProductsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminProductsPage({ params }: ProductsPageProps) {
  const { locale } = await params;

  const admin = createAdminClient();
  const { data: products = [], error } = await admin
    .from("products")
    .select("id, slug, name_mn, name_en, base_price, is_active, is_featured, categories(name_mn, name_en)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load products:", error.message);
  }

  type ProductRow = {
    id: string;
    slug: string;
    name_mn: string;
    name_en: string;
    base_price: number;
    is_active: boolean;
    is_featured: boolean;
    categories: { name_mn: string; name_en: string } | null;
  };

  const rows = (products ?? []) as unknown as ProductRow[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-normal">
          {locale === "mn" ? "Бараа бүтээгдэхүүн" : "Products"} ({rows.length})
        </h1>
        <Link
          href={`/${locale}/admin/products/new`}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 text-[12px] hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
          {locale === "mn" ? "Бараа нэмэх" : "New Product"}
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded p-12 text-center bg-white">
          <p className="text-[15px] text-gray-400 mb-2">
            {locale === "mn" ? "Бараа байхгүй байна" : "No products yet"}
          </p>
          <p className="text-[11px] text-gray-300">
            {error ? `Error: ${error.message}` : locale === "mn" ? "Шинэ бараа нэмэх товчийг дарна уу" : "Click 'New Product' to add your first product"}
          </p>
        </div>
      ) : (
        <div className="bg-white overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 font-normal text-[11px] uppercase tracking-wide text-gray-500 px-4">
                  {locale === "mn" ? "Нэр" : "Name"}
                </th>
                <th className="text-left py-3 font-normal text-[11px] uppercase tracking-wide text-gray-500 pr-4">
                  {locale === "mn" ? "Категори" : "Category"}
                </th>
                <th className="text-right py-3 font-normal text-[11px] uppercase tracking-wide text-gray-500 pr-4">
                  {locale === "mn" ? "Үнэ" : "Price"}
                </th>
                <th className="text-center py-3 font-normal text-[11px] uppercase tracking-wide text-gray-500 pr-4">
                  {locale === "mn" ? "Идэвхтэй" : "Active"}
                </th>
                <th className="py-3 pr-4" />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium">{locale === "mn" ? p.name_mn : p.name_en}</p>
                    {p.is_featured && (
                      <span className="text-[10px] text-blue-500">Featured</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-gray-500">
                    {p.categories ? (locale === "mn" ? p.categories.name_mn : p.categories.name_en) : "—"}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    {formatPrice(p.base_price, locale as "mn" | "en")}
                  </td>
                  <td className="py-3 pr-4 text-center">
                    <span className={`w-2 h-2 rounded-full inline-block ${p.is_active ? "bg-green-500" : "bg-gray-300"}`} />
                  </td>
                  <td className="py-3 pr-4 flex items-center">
                    <Link
                      href={`/${locale}/admin/products/${p.id}`}
                      className="text-[11px] hover:underline"
                    >
                      Edit
                    </Link>
                    <RestockDialog
                      productId={p.id}
                      productName={locale === "mn" ? p.name_mn : p.name_en}
                      locale={locale}
                    />
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
