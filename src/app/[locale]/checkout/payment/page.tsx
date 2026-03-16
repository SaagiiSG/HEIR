"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import { QRCodeSVG } from "qrcode.react";

type InvoiceState =
  | { phase: "creating" }
  | { phase: "open"; invoiceId: string; url: string }
  | { phase: "paid" }
  | { phase: "error"; message: string };

type PaymentTab = "qpay" | "card";

const BANKS = [
  { name: "Хаан банк", short: "Khan" },
  { name: "Голомт банк", short: "Golomt" },
  { name: "Хас банк", short: "Xac" },
  { name: "Төрийн банк", short: "State" },
  { name: "Тэргүүн банк", short: "TDB" },
  { name: "Капитал банк", short: "Capital" },
];

export default function PaymentPage() {
  const t = useTranslations("checkout");
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) ?? "mn";

  const searchParams = useSearchParams();
  const amount = Number(searchParams.get("amount") ?? 0);
  const description = searchParams.get("description") ?? "Heir Order";
  const orderId = searchParams.get("orderId") ?? "";

  const [state, setState] = useState<InvoiceState>({ phase: "creating" });
  const [tab, setTab] = useState<PaymentTab>("qpay");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const creatingRef = useRef(false);

  // Create invoice on mount
  useEffect(() => {
    if (!amount || amount <= 0) {
      setState({ phase: "error", message: "Төлбөрийн дүн тодорхойгүй байна" });
      return;
    }

    // Guard against React Strict Mode double-invoke
    if (creatingRef.current) return;
    creatingRef.current = true;

    async function createInvoice() {
      try {
        const res = await fetch("/api/byl/create-invoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, description, orderId }),
        });

        if (!res.ok) {
          const data = await res.json();
          setState({ phase: "error", message: data.error ?? "Invoice creation failed" });
          return;
        }

        const data = await res.json();
        setState({ phase: "open", invoiceId: String(data.invoice_id), url: data.url });
      } catch {
        setState({ phase: "error", message: "Network error" });
      }
    }

    createInvoice();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, description]);

  // Poll payment status every 3s while invoice is open
  useEffect(() => {
    if (state.phase !== "open") return;

    const { invoiceId } = state;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/byl/check/${invoiceId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.paid) {
          clearInterval(pollRef.current!);
          setState({ phase: "paid" });
          const orderRef = orderId ? `?order=${orderId.slice(0, 8).toUpperCase()}&method=byl` : "?method=byl";
          router.push(`/${locale}/checkout/confirmation${orderRef}`);
        }
      } catch {
        // Keep polling on transient errors
      }
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [state, locale, router]);

  return (
    <main className="px-5 py-10 max-w-[480px] mx-auto">
      <h1 className="text-[18px] font-normal mb-6 text-center">Төлбөр</h1>

      {/* Tab switcher */}
      <div className="flex border border-gray-200 rounded mb-6 overflow-hidden">
        <button
          onClick={() => setTab("qpay")}
          className={`flex-1 py-2.5 text-[13px] transition-colors ${
            tab === "qpay" ? "bg-black text-white" : "text-gray-500 hover:text-black"
          }`}
        >
          QPay
        </button>
        <button
          onClick={() => setTab("card")}
          className={`flex-1 py-2.5 text-[13px] transition-colors border-l border-gray-200 ${
            tab === "card" ? "bg-black text-white" : "text-gray-500 hover:text-black"
          }`}
        >
          Карт
        </button>
      </div>

      {/* QPay tab */}
      {tab === "qpay" && (
        <>
          {state.phase === "creating" && (
            <div className="flex flex-col items-center gap-3 py-16">
              <Spinner size="sm" />
              <p className="text-[12px] text-gray-400">Нэхэмжлэх үүсгэж байна…</p>
            </div>
          )}

          {state.phase === "open" && (
            <>
              {/* QR — desktop only */}
              <div className="hidden md:flex flex-col items-center border border-gray-200 rounded p-8 mb-5">
                <QRCodeSVG value={state.url} size={192} />
                <p className="text-[12px] text-gray-400 mt-4">
                  Банкны апп-аараа скан хийн төлнө үү
                </p>
              </div>

              {/* Bank app buttons — mobile only */}
              <div className="md:hidden mb-5">
                <p className="text-[12px] text-gray-400 mb-3 text-center">
                  Банкаа сонгон төлнө үү
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {BANKS.map((bank) => (
                    <a
                      key={bank.short}
                      href={state.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center border border-gray-200 rounded py-3 px-4 text-[13px] hover:border-black transition-colors"
                    >
                      {bank.name}
                    </a>
                  ))}
                </div>
              </div>

              {/* Polling indicator */}
              <div className="flex items-center justify-center gap-2 text-[12px] text-gray-400">
                <Spinner size="sm" />
                <span>Төлбөр хүлээж байна…</span>
              </div>
            </>
          )}

          {state.phase === "error" && (
            <p className="text-[13px] text-red-500 text-center py-8">{state.message}</p>
          )}
        </>
      )}

      {/* Card tab */}
      {tab === "card" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // TODO: wire up card payment processor
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-500 uppercase tracking-wide">
              Картын дугаар
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={19}
              placeholder="0000 0000 0000 0000"
              className="border border-gray-200 rounded px-4 py-3 text-[14px] focus:outline-none focus:border-black"
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                e.target.value = raw.replace(/(.{4})/g, "$1 ").trim();
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-gray-500 uppercase tracking-wide">
                Хүчинтэй хугацаа
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="MM/YY"
                className="border border-gray-200 rounded px-4 py-3 text-[14px] focus:outline-none focus:border-black"
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
                  e.target.value = raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-gray-500 uppercase tracking-wide">
                CVV
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="•••"
                className="border border-gray-200 rounded px-4 py-3 text-[14px] focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-500 uppercase tracking-wide">
              Картын эзэмшигчийн нэр
            </label>
            <input
              type="text"
              placeholder="FIRSTNAME LASTNAME"
              className="border border-gray-200 rounded px-4 py-3 text-[14px] uppercase placeholder:normal-case focus:outline-none focus:border-black"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full bg-black text-white text-[13px] py-3.5 rounded hover:bg-gray-800 transition-colors"
          >
            Төлбөр төлөх
          </button>

          <p className="text-[11px] text-gray-400 text-center">
            Картын мэдээлэл шифрлэгдсэн байдлаар дамжуулагдана
          </p>
        </form>
      )}
    </main>
  );
}
