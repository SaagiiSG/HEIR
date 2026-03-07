import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { Pagination } from "@/components/ui/Pagination";
import type { ProductCardData } from "@/components/product/ProductCard";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 24;
const EMPTY_UUID = "00000000-0000-0000-0000-000000000000";

interface StorePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    featured?: string;
    q?: string;
    category?: string;
    size?: string;
    page?: string;
  }>;
}

export default async function StorePage({ params, searchParams }: StorePageProps) {
  const { locale } = await params;
  const { featured, q, category, size, page: pageParam } = await searchParams;

  const isFeatured = featured === "true";
  const currentPage = Math.max(0, parseInt(pageParam ?? "0", 10) || 0);
  const isMn = locale === "mn";

  const supabase = await createClient();

  // Resolve category slug → UUID and size → product_ids in parallel
  const [catResult, sizeResult] = await Promise.all([
    category
      ? supabase.from("categories").select("id").eq("slug", category).single()
      : null,
    size
      ? supabase.from("product_variants").select("product_id").eq("size", size)
      : null,
  ]);

  const categoryId = catResult?.data?.id ?? null;
  const sizeProductIds = sizeResult?.data?.map((r) => r.product_id) ?? null;

  let query = supabase
    .from("products")
    .select("id, slug, name_en, name_mn, brand, base_price, compare_at_price, images, is_featured", { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE - 1);

  if (isFeatured) {
    query = query.eq("is_featured", true);
  }

  if (q) {
    query = query.or(`name_mn.ilike.%${q}%,name_en.ilike.%${q}%,brand.ilike.%${q}%`);
  }

  if (category && categoryId) {
    query = query.eq("category_id", categoryId);
  } else if (category && !categoryId) {
    // Unknown category slug — return nothing
    query = query.eq("id", EMPTY_UUID);
  }

  if (size) {
    if (sizeProductIds && sizeProductIds.length > 0) {
      query = query.in("id", sizeProductIds);
    } else {
      // No variants found for this size — return nothing
      query = query.eq("id", EMPTY_UUID);
    }
  }

  const { data: rawProducts, count } = await query;

  const products: ProductCardData[] = (rawProducts ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name_en,
    nameMn: p.name_mn,
    brand: p.brand,
    price: p.base_price,
    compareAtPrice: p.compare_at_price,
    image: p.images?.[0] ?? "",
    images: p.images ?? [],
    isFeatured: p.is_featured,
  }));

  const totalCount = count ?? 0;

  const heading = isFeatured
    ? (isMn ? "Онцлох бараа" : "Featured")
    : q
    ? (isMn ? `"${q}" хайлтын үр дүн` : `Results for "${q}"`)
    : (isMn ? "Бүх бараа" : "All Products");

  // Build searchParams record for Pagination
  const currentSearchParams: Record<string, string> = {};
  if (featured) currentSearchParams.featured = featured;
  if (q) currentSearchParams.q = q;
  if (category) currentSearchParams.category = category;
  if (size) currentSearchParams.size = size;

  const pathname = `/${locale}/store`;

  return (
    <main id="main-content" className="px-5 pt-10 pb-16">
      {/* Top bar: heading + search */}
      <div className="flex items-center justify-between gap-6 mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-[11px] uppercase tracking-[0.3em] font-normal shrink-0">
          {heading}
          <span className="ml-3 text-gray-400">{totalCount}</span>
        </h1>

        <form method="GET" action={pathname} className="flex gap-0 flex-1 max-w-[360px] ml-auto">
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder={isMn ? "ХАЙХ" : "SEARCH"}
            className="flex-1 border border-gray-300 border-r-0 px-3 py-2 text-[11px] uppercase tracking-wider outline-none focus:border-black placeholder:text-gray-400 transition-colors bg-transparent"
          />
          {featured && <input type="hidden" name="featured" value={featured} />}
          {category && <input type="hidden" name="category" value={category} />}
          {size && <input type="hidden" name="size" value={size} />}
          <button
            type="submit"
            className="px-4 py-2 border border-gray-300 text-[11px] uppercase tracking-wider hover:bg-black hover:text-white hover:border-black transition-colors"
          >
            →
          </button>
          {q && (
            <Link
              href={pathname}
              className="px-3 py-2 border border-gray-300 border-l-0 text-[11px] hover:border-black transition-colors text-gray-400 hover:text-black"
            >
              ✕
            </Link>
          )}
        </form>
      </div>

      {/* Horizontal filter bar */}
      <ProductFilters locale={locale} />

      {/* Grid */}
      <div className="mt-8">
        <ProductGrid products={products} locale={locale} />

        {products.length === 0 && (
          <div className="border border-gray-200 p-12 text-center mt-8">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">
              {isMn ? "Бараа байхгүй байна" : "No products found"}
            </p>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalCount={totalCount}
          pageSize={PAGE_SIZE}
          searchParams={currentSearchParams}
          pathname={pathname}
        />
      </div>
    </main>
  );
}
