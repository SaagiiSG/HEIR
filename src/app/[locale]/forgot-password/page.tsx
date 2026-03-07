"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validators";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const params = useParams();
  const locale = (params.locale as string) ?? "mn";
  const [sent, setSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setAuthError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/${locale}/account/profile`,
    });
    if (error) {
      setAuthError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="min-h-[calc(100vh-50px)] flex items-center justify-center px-5 py-20">
        <div className="w-full max-w-[360px] text-center">
          <p className="text-[15px] mb-4">{t("resetSent")}</p>
          <Link href={`/${locale}/login`} className="text-[13px] underline underline-offset-2">
            {t("loginLink")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-50px)] flex items-center justify-center px-5 py-20">
      <div className="w-full max-w-[360px]">
        <h1 className="text-[22px] font-normal mb-8 text-center">{t("resetPassword")}</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t("email")}
            id="email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />

          {authError && (
            <p className="text-[12px] text-red-500">{authError}</p>
          )}

          <Button
            variant="solid"
            size="lg"
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "..." : t("resetCta")}
          </Button>
        </form>

        <p className="text-center text-[12px] mt-8">
          <Link href={`/${locale}/login`} className="text-gray-500 hover:text-black transition-colors underline underline-offset-2">
            {t("loginLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
