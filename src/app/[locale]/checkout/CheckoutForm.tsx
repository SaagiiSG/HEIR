"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutFormData } from "@/lib/validators";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { createOrder } from "@/lib/actions/orders";
import { Spinner } from "@/components/ui/Spinner";
import { QRCodeSVG } from "qrcode.react";
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
  locale: string;
}

type PaymentPhase =
  | { step: "form" }
  | { step: "creating-invoice"; orderId: string; amount: number }
  | { step: "awaiting-payment"; orderId: string; invoiceId: string; url: string; amount: number }
  | { step: "error"; message: string };

const BANKS = [
  { name: "Хаан банк" },
  { name: "Голомт банк" },
  { name: "Хас банк" },
  { name: "Төрийн банк" },
  { name: "Тэргүүн банк" },
  { name: "Капитал банк" },
];

export function CheckoutForm({ locale }: CheckoutFormProps) {
  const router = useRouter();
  const isMn = locale === "mn";
  const { items, subtotal, clearCart } = useCart();
  const [serverError, setServerError] = useState<string | null>(null);
  const [phase, setPhase] = useState<PaymentPhase>({ step: "form" });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  // Create invoice once order is created
  useEffect(() => {
    if (phase.step !== "creating-invoice") return;
    const { orderId, amount } = phase;

    async function createInvoice() {
      try {
        const res = await fetch("/api/byl/create-invoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, description: "Heir Order", orderId }),
        });
        if (!res.ok) {
          const data = await res.json();
          setPhase({ step: "error", message: data.error ?? "Invoice creation failed" });
          return;
        }
        const data = await res.json();
        setPhase({
          step: "awaiting-payment",
          orderId,
          invoiceId: String(data.invoice_id),
          url: data.url,
          amount,
        });
      } catch {
        setPhase({ step: "error", message: "Network error" });
      }
    }

    createInvoice();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase.step]);

  // Poll while awaiting payment
  useEffect(() => {
    if (phase.step !== "awaiting-payment") return;
    const { invoiceId, orderId } = phase;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/byl/check/${invoiceId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.paid) {
          clearInterval(pollRef.current!);
          router.push(
            `/${locale}/checkout/confirmation?order=${orderId.slice(0, 8).toUpperCase()}&method=byl`
          );
        }
      } catch {
        // keep polling
      }
    }, 3000);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase.step]);

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
    setPhase({ step: "creating-invoice", orderId: result.orderId!, amount: subtotal });
  }

  if (items.length === 0 && phase.step === "form") {
    return (
      <main id="main-content" className="px-5 py-20 max-w-[500px] mx-auto text-center">
        <p className="text-[14px] text-gray-500 mb-6">
          {isMn ? "Сагс хоосон байна" : "Your cart is empty"}
        </p>
        <Link href={`/${locale}/store`} className="text-[12px] underline underline-offset-2">
          {isMn ? "Дэлгүүр рүү буцах" : "Back to store"}
        </Link>
      </main>
    );
  }

  // ── QR Payment view ──────────────────────────────────────────────────────────
  if (phase.step === "creating-invoice" || phase.step === "awaiting-payment") {
    return (
      <main id="main-content" className="px-5 py-16 max-w-[480px] mx-auto">
        <h1 className="text-[18px] font-normal mb-8 text-center">
          {isMn ? "Төлбөр" : "Payment"}
        </h1>

        <div className="flex justify-between text-[13px] mb-8 pb-6 border-b border-gray-100">
          <span className="text-gray-500">{isMn ? "Нийт дүн" : "Total"}</span>
          <span className="font-medium">{formatPrice(phase.amount, locale as "mn" | "en")}</span>
        </div>

        {phase.step === "creating-invoice" && (
          <div className="flex flex-col items-center gap-3 py-16">
            <Spinner size="sm" />
            <p className="text-[12px] text-gray-400">
              {isMn ? "Нэхэмжлэх үүсгэж байна…" : "Creating invoice…"}
            </p>
          </div>
        )}

        {phase.step === "awaiting-payment" && (
          <>
            {/* QR — desktop */}
            <div className="hidden md:flex flex-col items-center border border-gray-200 rounded p-8 mb-6">
              <QRCodeSVG value={phase.url} size={200} />
              <p className="text-[12px] text-gray-400 mt-4">
                {isMn ? "Банкны апп-аараа скан хийн төлнө үү" : "Scan with your banking app"}
              </p>
            </div>

            {/* Bank buttons — mobile */}
            <div className="md:hidden mb-6">
              <p className="text-[12px] text-gray-400 mb-3 text-center">
                {isMn ? "Банкаа сонгон төлнө үү" : "Select your bank to pay"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {BANKS.map((bank) => (
                  <a
                    key={bank.name}
                    href={phase.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center border border-gray-200 rounded py-3 px-4 text-[13px] hover:border-black transition-colors"
                  >
                    {bank.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-[12px] text-gray-400">
              <Spinner size="sm" />
              <span>{isMn ? "Төлбөр хүлээж байна…" : "Waiting for payment…"}</span>
            </div>
          </>
        )}
      </main>
    );
  }

  if (phase.step === "error") {
    return (
      <main id="main-content" className="px-5 py-20 max-w-[480px] mx-auto text-center">
        <p className="text-[13px] text-red-500 mb-6">{phase.message}</p>
        <button
          onClick={() => setPhase({ step: "form" })}
          className="text-[12px] underline underline-offset-2"
        >
          {isMn ? "Буцах" : "Go back"}
        </button>
      </main>
    );
  }

  // ── Checkout form ─────────────────────────────────────────────────────────────
  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* Progress */}
      <div className="max-w-[1000px] mx-auto px-6 pt-8">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide">
          <span className="font-medium">1. {isMn ? "Мэдээлэл" : "Details"}</span>
          <span className="text-gray-300">→</span>
          <span className="text-gray-400">2. {isMn ? "Төлбөр" : "Payment"}</span>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_380px]">

        {/* LEFT: Form */}
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

          {/* Billing address */}
          <div className="mb-8">
            <h2 className="text-[13px] font-medium mb-4">
              {isMn ? "Хүргэлтийн хаяг" : "Billing address"}
            </h2>

            <div className="border border-gray-300 rounded px-4 py-3 mb-3 flex items-center justify-between text-[13px] text-gray-600 bg-gray-50">
              <span>{isMn ? "Монгол улс" : "Mongolia"}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label htmlFor="firstName" className="sr-only">{isMn ? "Нэр" : "First name"}</label>
                <input
                  id="firstName"
                  {...register("firstName")}
                  placeholder={isMn ? "Нэр" : "First name"}
                  className="w-full border border-gray-300 rounded px-4 py-3 text-[13px] outline-none focus:border-black placeholder:text-gray-400 transition-colors"
                />
                {errors.firstName && (
                  <p role="alert" aria-live="polite" className="text-[11px] text-red-500 mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="sr-only">{isMn ? "Овог" : "Last name"}</label>
                <input
                  id="lastName"
                  {...register("lastName")}
                  placeholder={isMn ? "Овог" : "Last name"}
                  className="w-full border border-gray-300 rounded px-4 py-3 text-[13px] outline-none focus:border-black placeholder:text-gray-400 transition-colors"
                />
                {errors.lastName && (
                  <p role="alert" aria-live="polite" className="text-[11px] text-red-500 mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="address1" className="sr-only">{isMn ? "Хаяг" : "Address"}</label>
              <input
                id="address1"
                {...register("address1")}
                placeholder={isMn ? "Хаяг" : "Address"}
                className="w-full border border-gray-300 rounded px-4 py-3 text-[13px] outline-none focus:border-black placeholder:text-gray-400 transition-colors"
              />
              {errors.address1 && (
                <p role="alert" aria-live="polite" className="text-[11px] text-red-500 mt-1">{errors.address1.message}</p>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="district" className="sr-only">{isMn ? "Дүүрэг эсвэл сумын нэр" : "District / County"}</label>
              <input
                id="district"
                {...register("district")}
                placeholder={isMn ? "Дүүрэг эсвэл сумын нэр" : "District / County"}
                className="w-full border border-gray-300 rounded px-4 py-3 text-[13px] outline-none focus:border-black placeholder:text-gray-400 transition-colors"
              />
              {errors.district && (
                <p role="alert" aria-live="polite" className="text-[11px] text-red-500 mt-1">{errors.district.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="city" className="sr-only">{isMn ? "Хот эсвэл аймаг" : "City / Province"}</label>
                <input
                  id="city"
                  {...register("city")}
                  placeholder={isMn ? "Хот эсвэл аймаг" : "City / Province"}
                  className="w-full border border-gray-300 rounded px-4 py-3 text-[13px] outline-none focus:border-black placeholder:text-gray-400 transition-colors"
                />
                {errors.city && (
                  <p role="alert" aria-live="polite" className="text-[11px] text-red-500 mt-1">{errors.city.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="postalCode" className="sr-only">Postal Code</label>
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
              : (isMn ? "Төлбөр төлөх" : "Proceed to Payment")}
          </button>
        </form>

        {/* RIGHT: Order summary */}
        <div className="px-6 py-10 md:px-8 md:py-14 bg-gray-50/60">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded border border-gray-200 bg-gray-100 overflow-hidden">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} width={56} height={56} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-600 text-white text-[10px] flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] truncate">{isMn ? item.nameMn : item.name}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{item.size} / {item.color}</p>
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
