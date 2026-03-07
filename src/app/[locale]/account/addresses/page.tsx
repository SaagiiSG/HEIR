import { getTranslations } from "next-intl/server";
import Link from "next/link";

interface AddressesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AddressesPage({ params }: AddressesPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });

  // Saved addresses are not yet implemented — address is collected at checkout.
  const addresses: Array<{ id: string; label: string; address1: string; city: string }> = [];

  return (
    <main className="px-5 py-12 max-w-[700px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[22px] font-normal">{t("addresses")}</h1>
        <Link href={`/${locale}/account`} className="text-[12px] text-gray-500 hover:text-black transition-colors">
          ← {locale === "mn" ? "Буцах" : "Back"}
        </Link>
      </div>

      {addresses.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-[13px] text-gray-400">
            {locale === "mn" ? "Хадгалагдсан хаяг байхгүй" : "No saved addresses"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="border border-gray-200 p-4">
              <p className="text-[13px] font-medium mb-1">{addr.label}</p>
              <p className="text-[12px] text-gray-500">{addr.address1}</p>
              <p className="text-[12px] text-gray-500">{addr.city}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-[11px] text-gray-300">
          {locale === "mn" ? "Хаяг хадгалах боломж удахгүй нэмэгдэнэ" : "Saved addresses coming soon"}
        </p>
      </div>
    </main>
  );
}
