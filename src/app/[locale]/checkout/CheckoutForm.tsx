"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutFormData } from "@/lib/validators";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { createOrder } from "@/lib/actions/orders";
import Image from "next/image";
import Link from "next/link";

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  iban: string;
  accountHolder: string;
  reference: string;
  instagram: string;
}

interface CheckoutFormProps {
  bankDetails: BankDetails;
  locale: string;
}

export function CheckoutForm({ bankDetails, locale }: CheckoutFormProps) {
  const router = useRouter();
  const isMn = locale === "mn";
  const { items, subtotal, clearCart } = useCart();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  async function onSubmit(data: CheckoutFormData) {
    setServerError(null);

    const result = await createOrder({
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      address1: data.address1,
      district: data.district,
      city: data.city,
      postalCode: data.postalCode,
      locale,
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        nameMn: item.nameMn,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
      subtotal,
    });

    if (result.error) {
      setServerError(result.error);
      return;
    }

    clearCart();
    router.push(`/${locale}/checkout/confirmation?order=${result.orderId?.slice(0, 8).toUpperCase()}`);
  }

  if (items.length === 0) {
    return (
      <main id="main-content" className="px-5 py-20 max-w-[500px] mx-auto text-center">
        <p className="text-[14px] text-gray-500 mb-6">
          {isMn ? "Сагс хоосон байна" : "Your cart is empty"}
        </p>
        <Link
          href={`/${locale}/store`}
          className="text-[12px] underline underline-offset-2"
        >
          {isMn ? "Дэлгүүр рүү буцах" : "Back to store"}
        </Link>
      </main>
    );
  }

  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* ── Progress indicator ── */}
      <div className="max-w-[1000px] mx-auto px-6 pt-8">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide">
          <span className="font-medium">1. {isMn ? "Мэдээлэл" : "Details"}</span>
          <span className="text-gray-300">→</span>
          <span className="text-gray-400">2. {isMn ? "Баталгаажуулах" : "Review"}</span>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_380px]">

        {/* ── LEFT: Form ── */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-6 py-10 md:px-10 md:py-14 border-r border-gray-100"
        >
          {/* Contact */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-medium">
                {isMn ? "Холбоо барих" : "Contact"}
              </h2>
              <Link
                href={`/${locale}/login?next=/${locale}/checkout`}
                className="text-[12px] text-gray-500 hover:text-black underline underline-offset-2"
              >
                {isMn ? "Нэвтрэх" : "Sign in"}
              </Link>
            </div>
            <label htmlFor="phone" className="sr-only">
              {isMn ? "Утасны дугаар" : "Phone number"}
            </label>
            <input
              id="phone"
              {...register("phone")}
              type="tel"
              placeholder={isMn ? "Утасны дугаар" : "Phone number"}
              className="w-full border border-gray-300 rounded px-4 py-3 text-[13px] outline-none focus:border-black placeholder:text-gray-400 transition-colors"
            />
            {errors.phone && (
              <p role="alert" aria-live="polite" className="text-[11px] text-red-500 mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Payment method */}
          <div className="mb-8">
            <h2 className="text-[13px] font-medium mb-1">
              {isMn ? "Төлбөр төлөх" : "Payment"}
            </h2>
            <p className="text-[11px] text-gray-400 mb-4">
              {isMn
                ? "Бүх гүйлгээ аюулгүй, шифрлэгдсэн байна."
                : "All transactions are secure and encrypted."}
            </p>

            {/* Bank transfer option */}
            <div className="border border-gray-900 rounded overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-900 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-900" />
                </div>
                <span className="text-[13px]">
                  {isMn ? "Дансаар шилжүүлэх" : "Bank Transfer"}
                </span>
              </div>

              {/* Bank details — fetched server-side, never in client bundle */}
              <div className="px-4 py-4 bg-white text-[12px] leading-relaxed space-y-1 text-gray-700">
                <p>
                  <span className="font-medium">БАНКНЫ НЭР:</span>{" "}
                  {bankDetails.bankName}
                </p>
                <p>
                  <span className="font-medium">ДАНСНЫ ДУГААР:</span>{" "}
                  {bankDetails.accountNumber}
                </p>
                <p>
                  <span className="font-medium">IBAN ДУГААР:</span>{" "}
                  {bankDetails.iban}
                </p>
                <p>
                  <span className="font-medium">ДАНСНЫ НЭР:</span>{" "}
                  {bankDetails.accountHolder}
                </p>
                <p>
                  <span className="font-medium">ГҮЙЛГЭЭНИЙ УТГА:</span>{" "}
                  {bankDetails.reference}
                </p>

                <div className="pt-2 space-y-1 text-gray-600">
                  <p>
                    ТӨЛБӨР ШИЛЖҮҮЛСНИЙ ДАРАА{" "}
                    <span className="font-medium">{bankDetails.instagram}</span>{" "}
                    {isMn
                      ? "ГЭСЭН ИНСТАГРАМ ХАЯГРУУ ГҮЙЛГЭЭНИЙ SCREENSHOT ИЛГЭЭЖ ЗАХИАЛГА БАТАЛГААЖСАН ЭСЭХИЙГ ШАЛГАНА УУ!"
                      : "INSTAGRAM-д ГҮЙЛГЭЭНИЙ SCREENSHOT ИЛГЭЭЖ ЗАХИАЛГАА БАТАЛГААЖУУЛНА УУ!"}
                  </p>
                  <p className="text-gray-400 text-[11px]">
                    {isMn
                      ? "Зөвхөн төлбөр төлөгдсөн захиалга баталгаажих болохыг анхааарна уу!"
                      : "Only orders with confirmed payment will be processed."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Billing address */}
          <div className="mb-8">
            <h2 className="text-[13px] font-medium mb-4">
              {isMn ? "Хүргэлтийн хаяг" : "Billing address"}
            </h2>

            {/* Country — locked to Mongolia */}
            <div className="border border-gray-300 rounded px-4 py-3 mb-3 flex items-center justify-between text-[13px] text-gray-600 bg-gray-50">
              <span>{isMn ? "Монгол улс" : "Mongolia"}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>

            {/* Нэр + Овог */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label htmlFor="firstName" className="sr-only">
                  {isMn ? "Нэр" : "First name"}
                </label>
                <input
                  id="firstName"
                  {...register("firstName")}
                  placeholder={isMn ? "Нэр" : "First name"}
                  className="w-full border border-gray-300 rounded px-4 py-3 text-[13px] outline-none focus:border-black placeholder:text-gray-400 transition-colors"
                />
                {errors.firstName && (
                  <p role="alert" aria-live="polite" className="text-[11px] text-red-500 mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="sr-only">
                  {isMn ? "Овог" : "Last name"}
                </label>
                <input
                  id="lastName"
                  {...register("lastName")}
                  placeholder={isMn ? "Овог" : "Last name"}
                  className="w-full border border-gray-300 rounded px-4 py-3 text-[13px] outline-none focus:border-black placeholder:text-gray-400 transition-colors"
                />
                {errors.lastName && (
                  <p role="alert" aria-live="polite" className="text-[11px] text-red-500 mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Хаяг */}
            <div className="mb-3">
              <label htmlFor="address1" className="sr-only">
                {isMn ? "Хаяг" : "Address"}
              </label>
              <input
                id="address1"
                {...register("address1")}
                placeholder={isMn ? "Хаяг" : "Address"}
                className="w-full border border-gray-300 rounded px-4 py-3 text-[13px] outline-none focus:border-black placeholder:text-gray-400 transition-colors"
              />
              {errors.address1 && (
                <p role="alert" aria-live="polite" className="text-[11px] text-red-500 mt-1">
                  {errors.address1.message}
                </p>
              )}
            </div>

            {/* Дүүрэг */}
            <div className="mb-3">
              <label htmlFor="district" className="sr-only">
                {isMn ? "Дүүрэг эсвэл сумын нэр" : "District / County"}
              </label>
              <input
                id="district"
                {...register("district")}
                placeholder={isMn ? "Дүүрэг эсвэл сумын нэр" : "District / County"}
                className="w-full border border-gray-300 rounded px-4 py-3 text-[13px] outline-none focus:border-black placeholder:text-gray-400 transition-colors"
              />
              {errors.district && (
                <p role="alert" aria-live="polite" className="text-[11px] text-red-500 mt-1">
                  {errors.district.message}
                </p>
              )}
            </div>

            {/* Хот + Postal */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="city" className="sr-only">
                  {isMn ? "Хот эсвэл аймаг" : "City / Province"}
                </label>
                <input
                  id="city"
                  {...register("city")}
                  placeholder={isMn ? "Хот эсвэл аймаг" : "City / Province"}
                  className="w-full border border-gray-300 rounded px-4 py-3 text-[13px] outline-none focus:border-black placeholder:text-gray-400 transition-colors"
                />
                {errors.city && (
                  <p role="alert" aria-live="polite" className="text-[11px] text-red-500 mt-1">
                    {errors.city.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="postalCode" className="sr-only">
                  {isMn ? "Postal Code" : "Postal Code"}
                </label>
                <input
                  id="postalCode"
                  {...register("postalCode")}
                  placeholder={isMn ? "Postal Code (Шаардлагагүй)" : "Postal Code (Optional)"}
                  className="w-full border border-gray-300 rounded px-4 py-3 text-[13px] outline-none focus:border-black placeholder:text-gray-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {serverError && (
            <p role="alert" aria-live="polite" className="text-[12px] text-red-500 mb-4">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white py-4 text-[13px] tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-60 rounded"
          >
            {isSubmitting
              ? (isMn ? "Илгээж байна..." : "Placing order...")
              : (isMn ? "Захиалга гүйцээх" : "Complete Order")}
          </button>
        </form>

        {/* ── RIGHT: Order summary ── */}
        <div className="px-6 py-10 md:px-8 md:py-14 bg-gray-50/60">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                {/* Thumbnail with quantity badge */}
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded border border-gray-200 bg-gray-100 overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={56}
                        height={56}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-600 text-white text-[10px] flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[13px] truncate">
                    {isMn ? item.nameMn : item.name}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {item.size} / {item.color}
                  </p>
                </div>

                <p className="text-[13px] shrink-0">
                  {formatPrice(item.price * item.quantity, locale as "mn" | "en")}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 mt-6 pt-5 space-y-2">
            <div className="flex justify-between text-[12px] text-gray-500">
              <span>{isMn ? "Дэд нийт" : "Subtotal"}</span>
              <span>{formatPrice(subtotal, locale as "mn" | "en")}</span>
            </div>
            <div className="flex justify-between text-[12px] text-gray-500">
              <span>{isMn ? "Хүргэлт" : "Shipping"}</span>
              <span className="text-gray-400">{isMn ? "Үнэгүй" : "Free"}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between">
            <div>
              <p className="text-[13px] font-medium">{isMn ? "Нийт" : "Total"}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">MNT</p>
            </div>
            <p className="text-[22px] font-medium">
              {formatPrice(subtotal, locale as "mn" | "en")}
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
