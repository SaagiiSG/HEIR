import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccountClient from "./AccountClient";

interface AccountPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { locale } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login?next=/${locale}/account`);
  }

  const [profileResult, ordersResult, productsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single(),
    supabase
      .from("orders")
      .select("id, created_at, status, total")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("products")
      .select("images")
      .eq("status", "published")
      .not("images", "eq", "{}")
      .limit(12),
  ]);

  // Flatten product images into a single carousel array
  const carouselImages = (productsResult.data ?? [])
    .flatMap((p) => (p.images as string[]) ?? [])
    .filter(Boolean)
    .slice(0, 10);

  return (
    <AccountClient
      locale={locale}
      user={{ id: user.id, email: user.email ?? "" }}
      profile={profileResult.data}
      orders={ordersResult.data ?? []}
      carouselImages={carouselImages}
    />
  );
}
