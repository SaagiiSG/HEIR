"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validators";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";

export default function LoginPage() {
  const t = useTranslations("auth");
  const params = useParams();
  const locale = (params.locale as string) ?? "mn";
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setAuthError(null);
    const supabase = createClient();
    const { error, data: authData } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setAuthError(error.message);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();
    if (profile?.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  }

  function handleGoogleAuth() {
    const supabase = createClient();
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });
  }

  return (
    <div className="min-h-[calc(100vh-50px)] flex items-center justify-center px-5 py-20">
      <div className="w-full max-w-[360px]">
        <h1 className="text-[22px] font-normal mb-8 text-center">{t("loginTitle")}</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t("email")}
            id="email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label={t("password")}
            id="password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />

          {authError && (
            <p className="text-[12px] text-red-500">{authError}</p>
          )}

          <div className="text-right">
            <Link
              href={`/${locale}/forgot-password`}
              className="text-[11px] text-gray-500 hover:text-black transition-colors"
            >
              {t("forgotPassword")}
            </Link>
          </div>

          <Button
            variant="solid"
            size="lg"
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "..." : t("loginCta")}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-[11px] text-gray-400">{t("orContinueWith")}</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={handleGoogleAuth}
        >
          {t("continueWithGoogle")}
        </Button>

        <p className="text-center text-[12px] mt-8 text-gray-500">
          {t("noAccount")}{" "}
          <Link href={`/${locale}/register`} className="text-black underline underline-offset-2">
            {t("registerLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
