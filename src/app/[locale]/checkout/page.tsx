import { createAdminClient } from "@/lib/supabase/admin";
import { CheckoutForm, type BankDetails } from "./CheckoutForm";

interface CheckoutPageProps {
  params: Promise<{ locale: string }>;
}

const DEFAULT_BANK_DETAILS: BankDetails = {
  bankName: "Худалдаа хөгжлийн банк",
  accountNumber: "457194178",
  iban: "MN460004000",
  accountHolder: "ТОДГЭРЭЛТ ГАНЗОРИГ",
  reference: "Өөрийн утасны дугаар болон Instagram хаягаа бичнэ үү.",
  instagram: "@heir.rchive",
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale } = await params;

  // Fetch bank details from DB — never exposed to the client bundle
  let bankDetails = DEFAULT_BANK_DETAILS;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("site_settings")
      .select("bank_details")
      .eq("id", "default")
      .single();
    if (data?.bank_details && typeof data.bank_details === "object" && Object.keys(data.bank_details).length > 0) {
      bankDetails = { ...DEFAULT_BANK_DETAILS, ...(data.bank_details as Partial<BankDetails>) };
    }
  } catch {
    // use defaults silently
  }

  return <CheckoutForm bankDetails={bankDetails} locale={locale} />;
}
