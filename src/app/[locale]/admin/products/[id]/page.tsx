import { createAdminClient } from "@/lib/supabase/admin";
import { EditProductClient } from "@/components/admin/EditProductClient";

interface EditProductPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { locale, id: productId } = await params;
  const supabase = createAdminClient();

  const [{ data: categories }, { data: product }] = await Promise.all([
    supabase.from("categories").select("id, slug, name_mn, name_en").order("name_en"),
    supabase
      .from("products")
      .select("*, product_images(*), product_variants(*)")
      .eq("id", productId)
      .single(),
  ]);

  // Build per-color image map from product_images tagged with color_hex
  const colorImgsByHex: Record<string, string[]> = {};
  for (const img of (product?.product_images ?? []) as { url: string; color_hex: string | null }[]) {
    if (img.color_hex) {
      (colorImgsByHex[img.color_hex] ??= []).push(img.url);
    }
  }

  const initialData = product
    ? {
        name_mn: product.name_mn,
        name_en: product.name_en,
        description_mn: product.description_mn ?? "",
        description_en: product.description_en ?? "",
        base_price: product.base_price,
        compare_at_price: product.compare_at_price ?? null,
        category_id: product.category_id ?? "",
        is_active: product.is_active,
        is_featured: product.is_featured ?? false,
        images: ((product.product_images ?? []) as { id: string; url: string; is_primary: boolean; color_hex: string | null }[])
          .filter((img) => !img.color_hex)
          .map((img) => ({ id: img.id, url: img.url, is_primary: img.is_primary })),
        variants: ((product.product_variants ?? []) as { id: string; size: string; color: string; color_hex: string | null; stock: number; sku: string | null }[]).map((v) => ({
          id: v.id,
          size: v.size,
          color_name_en: v.color,
          color_name_mn: v.color,
          color_hex: v.color_hex ?? "",
          stock: v.stock,
          sku: v.sku ?? "",
          images: colorImgsByHex[v.color_hex ?? ""] ?? [],
        })),
      }
    : undefined;

  return (
    <EditProductClient
      locale={locale}
      productId={productId}
      initialData={initialData}
      categories={categories ?? []}
    />
  );
}
