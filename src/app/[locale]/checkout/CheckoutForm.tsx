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

export interface CheckoutFormProps {
  locale: string;
}

type PaymentPhase =
  | { step: "form" }
  | { step: "creating-invoice"; orderId: string; amount: number }
  | { step: "awaiting-payment"; orderId: string; invoiceId: string; url: string; amount: number }
  | { step: "error"; message: string };

const BANKS = [
  "Хаан банк",
  "Голомт банк",
  "Хас банк",
  "Төрийн банк",
  "Тэргүүн банк",
  "Капитал банк",
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

  // Create BYL invoice once order is saved
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
        setPhase({ step: "awaiting-payment", orderId, invoiceId: String(data.invoice_id), url: data.url, amount });
      } catch {
        setPhase({ step: "error", message: "Network error" });
      }
    }

    createInvoice();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase.step]);

  // Poll while waiting for payment
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
          router.push(`/${locale}/checkout/confirmation?order=${orderId.slice(0, 8).toUpperCase()}`);
        }
      } catch {
        // keep polling on transient errors
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

  const inPayment = phase.step === "creating-invoice" || phase.step === "awaiting-payment";

  if (items.length === 0 && !inPayment) {
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

  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* Progress */}
      <div className="max-w-[1000px] mx-auto px-6 pt-8">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide">
          <span className={inPayment ? "text-gray-400" : "font-medium"}>
            1. {isMn ? "Мэдээлэл" : "Details"}
          </span>
          <span className="text-gray-300">→</span>
          <span className={inPayment ? "font-medium" : "text-gray-400"}>
            2. {isMn ? "Төлбөр" : "Payment"}
          </span>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_380px]">

        {/* LEFT: Form or "scan to pay" state */}
        <div className="px-6 py-10 md:px-10 md:py-14 border-r border-gray-100">
          {inPayment ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[320px] gap-4 text-center">
              {phase.step === "creating-invoice" ? (
                <>
                  <Spinner size="sm" />
                  <p className="text-[13px] text-gray-500">
                    {isMn ? "Нэхэмжлэх үүсгэж байна…" : "Creating invoice…"}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                    </svg>
                  </div>
                  <p className="text-[15px] font-normal">
                    {isMn ? "QR кодоо скан хийж төлнө үү" : "Scan the QR code to pay"}
                  </p>
                  <p className="text-[12px] text-gray-400">
                    {isMn ? "Банкны апп нээгээд баруун талын QR кодыг скан хийнэ үү" : "Open your banking app and scan the QR on the right"}
                  </p>
                  <div className="flex items-center gap-2 text-[12px] text-gray-400 mt-2">
                    <Spinner size="sm" />
                    <span>{isMn ? "Төлбөр хүлээж байна…" : "Waiting for payment…"}</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Contact */}
              <div className="mb-8">
                <h2 className="text-[13px] font-medium mb-4">
                  {isMn ? "Холбоо барих" : "Contact"}
                </h2>
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
                    <input id="firstName" {...register("firstName")} placeholder={isMn ? "Нэр" : "First name"}
                      className="w-full border border-gray-300 rounded px-4 py-3 text-[13px] outline-none focus:border-black placeholder:text-gray-400 transition-colors" />
                    {errors.firstName && <p role="alert" className="text-[11px] text-red-500 mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="sr-only">{isMn ? "Овог" : "Last name"}</label>
                    <input id="lastName" {...register("lastName")} placeholder={isMn ? "Овог" : "Last name"}
                      className="w-full border border-gray-300 rounded px-4 py-3 text-[13px] outline-none focus:border-black placeholder:text-gray-400 transition-colors" />
                    {errors.lastName && <p role="alert" className="text-[11px] text-red-500 mt-1">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="address1" className="sr-only">{isMn ? "Хаяг" : "Address"}</label>
                  <input id="address1" {...register("address1")} placeholder={isMn ? "Хаяг" : "Address"}
                    className="w-full border border-gray-300 rounded px-4 py-3 text-[13px] outline-none focus:border-black placeholder:text-gray-400 transition-colors" />
                  {errors.address1 && <p role="alert" className="text-[11px] text-red-500 mt-1">{errors.address1.message}</p>}
                </div>

                <div className="mb-3">
                  <label htmlFor="district" className="sr-only">{isMn ? "Дүүрэг эсвэл сумын нэр" : "District"}</label>
                  <input id="district" {...register("district")} placeholder={isMn ? "Дүүрэг эсвэл сумын нэр" : "District / County"}
                    className="w-full border border-gray-300 rounded px-4 py-3 text-[13px] outline-none focus:border-black placeholder:text-gray-400 transition-colors" />
                  {errors.district && <p role="alert" className="text-[11px] text-red-500 mt-1">{errors.district.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="city" className="sr-only">{isMn ? "Хот эсвэл аймаг" : "City"}</label>
                    <input id="city" {...register("city")} placeholder={isMn ? "Хот эсвэл аймаг" : "City / Province"}
                      className="w-full border border-gray-300 rounded px-4 py-3 text-[13px] outline-none focus:border-black placeholder:text-gray-400 transition-colors" />
                    {errors.city && <p role="alert" className="text-[11px] text-red-500 mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="sr-only">Postal Code</label>
                    <input id="postalCode" {...register("postalCode")} placeholder={isMn ? "Postal Code (Шаардлагагүй)" : "Postal Code (Optional)"}
                      className="w-full border border-gray-300 rounded px-4 py-3 text-[13px] outline-none focus:border-black placeholder:text-gray-400 transition-colors" />
                  </div>
                </div>
              </div>

              {serverError && (
                <p role="alert" className="text-[12px] text-red-500 mb-4">{serverError}</p>
              )}

              {phase.step === "error" && (
                <p role="alert" className="text-[12px] text-red-500 mb-4">{phase.message}</p>
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
          )}
        </div>

        {/* RIGHT: Order summary or QR */}
        <div className="px-6 py-10 md:px-8 md:py-14 bg-gray-50/60">
          {inPayment && phase.step === "awaiting-payment" ? (
            /* QR payment panel */
            <div className="flex flex-col items-center gap-5">
              <p className="text-[12px] text-gray-500 self-start">
                {isMn ? "Нийт дүн" : "Total"}{" "}
                <span className="font-medium text-black">
                  {formatPrice(phase.amount, locale as "mn" | "en")}
                </span>
              </p>

              {/* QR — desktop */}
              <div className="hidden md:flex flex-col items-center border border-gray-200 rounded bg-white p-6 w-full">
                <QRCodeSVG value={phase.url} size={192} />
                <p className="text-[11px] text-gray-400 mt-4 text-center">
                  {isMn ? "Банкны апп-аараа скан хийн төлнө үү" : "Scan with your banking app"}
                </p>
              </div>

              {/* Bank buttons — mobile */}
              <div className="md:hidden w-full">
                <p className="text-[12px] text-gray-400 mb-3 text-center">
                  {isMn ? "Банкаа сонгон төлнө үү" : "Select your bank"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {BANKS.map((name) => (
                    <a key={name} href={phase.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center border border-gray-200 rounded py-3 px-2 text-[12px] bg-white hover:border-black transition-colors">
                      {name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ) : inPayment && phase.step === "creating-invoice" ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <Spinner size="sm" />
            </div>
          ) : (
            /* Order summary */
            <>
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
            </>
          )}
        </div>

      </div>
    </main>
  );
}
