import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { ToastProvider } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect(`/${locale}`);

  return (
    <ToastProvider>
      <div className="flex min-h-[calc(100vh-50px)]">
        <AdminSidebar />
        <main className="flex-1 p-8 bg-gray-50/50">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
