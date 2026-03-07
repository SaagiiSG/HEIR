import { ProductCard, type ProductCardData } from "./ProductCard";

interface ProductGridProps {
  products: ProductCardData[];
  locale: string;
  loading?: boolean;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square bg-gray-200 mb-3" />
      <div className="flex justify-between mb-1.5">
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="h-3 w-20 bg-gray-200 rounded" />
      </div>
      <div className="h-3 w-full bg-gray-200 rounded mb-1" />
      <div className="h-3 w-3/4 bg-gray-200 rounded" />
    </div>
  );
}

export function ProductGrid({ products, locale, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-[13px] text-gray-400">
          {locale === "mn" ? "Бараа байхгүй байна" : "No products found"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} locale={locale} />
      ))}
    </div>
  );
}
