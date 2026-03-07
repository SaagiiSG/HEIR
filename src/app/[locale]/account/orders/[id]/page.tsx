import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/Badge";

interface OrderDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale });

  // TODO: Fetch order by id from Supabase
  // const supabase = await createClient();
  // const { data: order } = await supabase.from('orders').select('*, order_items(*, products(*))').eq('id', id).single();

  return (
    <main className="px-5 py-12 max-w-[700px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[22px] font-normal">
          {t("checkout.orderNumber")}: <span className="font-mono text-[18px]">{id.slice(0, 8).toUpperCase()}</span>
        </h1>
        <Link href={`/${locale}/account/orders`} className="text-[12px] text-gray-500 hover:text-black transition-colors">
          ← {t("common.back")}
        </Link>
      </div>

      <div className="border border-dashed border-gray-200 rounded p-6">
        <p className="text-[13px] text-gray-400 mb-2">
          {locale === "mn" ? "Захиалгын дэлгэрэнгүй:" : "Order details:"}
        </p>
        <p className="text-[11px] font-mono text-gray-300">
          TODO: Fetch order {id} from Supabase
        </p>
      </div>
    </main>
  );
}
