"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/lib/validators";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const params = useParams();
  const locale = (params.locale as string) ?? "mn";
  const [authError, setAuthError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    setAuthError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
        },
      },
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
          <p className="text-[15px] mb-2">{t("checkEmail")}</p>
          <p className="text-[12px] text-gray-500 mb-6">{t("confirmEmailSent")}</p>
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
        <h1 className="text-[22px] font-normal mb-8 text-center">{t("registerTitle")}</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t("lastName")}
              id="lastName"
              error={errors.lastName?.message}
              {...register("lastName")}
            />
            <Input
              label={t("firstName")}
              id="firstName"
              error={errors.firstName?.message}
              {...register("firstName")}
            />
          </div>
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
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Input
            label={t("confirmPassword")}
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
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
            {isSubmitting ? "..." : t("registerCta")}
          </Button>
        </form>

        <p className="text-center text-[12px] mt-8 text-gray-500">
          {t("hasAccount")}{" "}
          <Link href={`/${locale}/login`} className="text-black underline underline-offset-2">
            {t("loginLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
