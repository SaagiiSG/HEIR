"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) ?? "mn";
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push(`/${locale}/login`); return; }
      setEmail(user.email ?? "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();
      if (profile) {
        setFirstName(profile.first_name ?? "");
        setLastName(profile.last_name ?? "");
      }
      setLoaded(true);
    }
    load();
  }, [locale, router]);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ first_name: firstName, last_name: lastName })
      .eq("id", user.id);
    setSaving(false);
    setMessage(error
      ? { type: "error", text: error.message }
      : { type: "success", text: locale === "mn" ? "Хадгалагдлаа" : "Saved successfully" }
    );
  }

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}`);
    router.refresh();
  }

  return (
    <main className="min-h-[calc(100vh-50px)] px-5 py-16 max-w-[560px] mx-auto">

      {/* Back */}
      <Link
        href={`/${locale}/account`}
        className="inline-flex items-center gap-2 text-[12px] text-gray-400 hover:text-black transition-colors mb-14"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        {t("common.back")}
      </Link>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-[28px] font-normal tracking-tight">
          {t("account.settings")}
        </h1>
        {email && (
          <p className="text-[13px] text-gray-400 mt-2">{email}</p>
        )}
      </div>

      {/* Name fields */}
      <section className="mb-12">
        <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-6">
          {locale === "mn" ? "Хувийн мэдээлэл" : "Personal information"}
        </p>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("auth.lastName")}
              id="lastName"
              value={loaded ? lastName : ""}
              onChange={(e) => setLastName(e.target.value)}
            />
            <Input
              label={t("auth.firstName")}
              id="firstName"
              value={loaded ? firstName : ""}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <Input
            label={t("auth.email")}
            id="email"
            type="email"
            value={email}
            disabled
            className="bg-gray-50 text-gray-400 cursor-not-allowed"
            onChange={() => {}}
          />
        </div>

        {message && (
          <p className={`text-[12px] mt-4 ${message.type === "success" ? "text-green-600" : "text-red-500"}`}>
            {message.text}
          </p>
        )}

        <div className="mt-8">
          <Button
            variant="solid"
            size="md"
            onClick={handleSave}
            disabled={saving || !loaded}
          >
            {saving ? "..." : t("common.save")}
          </Button>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Danger zone */}
      <section className="mt-12">
        <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-6">
          {locale === "mn" ? "Гарах" : "Session"}
        </p>
        <p className="text-[13px] text-gray-500 mb-6">
          {locale === "mn"
            ? "Системээс гарахад бүх нэвтрэлт дуусгавар болно."
            : "Signing out will end your current session."}
        </p>
        <Button
          variant="outline"
          size="md"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? "..." : t("common.logout")}
        </Button>
      </section>

    </main>
  );
}
