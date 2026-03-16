import { CheckoutForm } from "./CheckoutForm";

interface CheckoutPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale } = await params;
  return <CheckoutForm locale={locale} />;
}
