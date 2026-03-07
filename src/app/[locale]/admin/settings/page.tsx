import { getSiteSettings } from "@/lib/actions/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";

interface AdminSettingsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminSettingsPage({ params }: AdminSettingsPageProps) {
  const { locale } = await params;
  const settings = await getSiteSettings();

  return (
    <div className="max-w-[600px] space-y-8">
      <h1 className="text-[20px] font-normal">
        {locale === "mn" ? "Тохиргоо" : "Settings"}
      </h1>
      <SettingsForm initialSettings={settings} locale={locale} />
    </div>
  );
}
