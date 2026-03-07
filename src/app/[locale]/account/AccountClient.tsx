"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { X, ArrowRight } from "lucide-react";

type DrawerType = "orders" | "addresses" | "settings" | null;

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
}

interface Props {
  locale: string;
  user: { id: string; email: string };
  profile: { first_name: string | null; last_name: string | null } | null;
  orders: Order[];
  carouselImages: string[];
}

export default function AccountClient({ locale, user, profile, orders, carouselImages }: Props) {
  const [drawer, setDrawer] = useState<DrawerType>(null);
  const [slide, setSlide] = useState(0);
  const [firstName, setFirstName] = useState(profile?.first_name ?? "");
  const [lastName, setLastName] = useState(profile?.last_name ?? "");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const images = carouselImages.length > 0 ? carouselImages : [];

  // Carousel auto-advance
  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setSlide(i => (i + 1) % images.length), 4500);
    return () => clearInterval(t);
  }, [images.length]);

  // Escape closes drawer
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawer(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Lock body scroll while drawer open
  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawer]);

  async function handleSave() {
    setSaving(true);
    setSaveMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ first_name: firstName, last_name: lastName })
      .eq("id", user.id);
    setSaving(false);
    setSaveMsg(error
      ? { type: "error", text: error.message }
      : { type: "success", text: locale === "mn" ? "Хадгалагдлаа" : "Saved successfully" }
    );
  }

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = `/${locale}`;
  }

  const displayName = [profile?.last_name, profile?.first_name].filter(Boolean).join(" ") || null;

  const navItems: { id: DrawerType; label: string; meta: string }[] = [
    {
      id: "orders",
      label: locale === "mn" ? "Захиалгууд" : "Orders",
      meta: orders.length
        ? `${orders.length} ${locale === "mn" ? "захиалга" : orders.length === 1 ? "order" : "orders"}`
        : locale === "mn" ? "Захиалга байхгүй" : "No orders",
    },
    {
      id: "addresses",
      label: locale === "mn" ? "Хаягууд" : "Addresses",
      meta: locale === "mn" ? "Хадгалагдсан хаягууд" : "Saved addresses",
    },
    {
      id: "settings",
      label: locale === "mn" ? "Тохиргоо" : "Settings",
      meta: locale === "mn" ? "Нэр, имэйл" : "Name, email",
    },
  ];

  const drawerTitle = {
    orders: locale === "mn" ? "Захиалгууд" : "Orders",
    addresses: locale === "mn" ? "Хаягууд" : "Addresses",
    settings: locale === "mn" ? "Тохиргоо" : "Settings",
  };

  return (
    <>
      {/* Split layout */}
      <div className="flex h-[calc(100vh-50px)]">

        {/* ── Left column ── */}
        <div className="w-full md:w-[42%] flex flex-col justify-between px-8 md:px-16 py-14">

          {/* Identity */}
          <div>
            <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-10">
              {locale === "mn" ? "Миний бүртгэл" : "My account"}
            </p>
            <h1 className="text-[38px] font-normal tracking-tight leading-[1.1] mb-2">
              {displayName ?? user.email}
            </h1>
            {displayName && (
              <p className="text-[13px] text-gray-400">{user.email}</p>
            )}
          </div>

          {/* Nav */}
          <nav className="w-full">
            {navItems.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setDrawer(item.id)}
                className={`w-full flex items-center justify-between py-5 text-left group transition-colors hover:text-gray-400 ${
                  i < navItems.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <span className="text-[15px]">{item.label}</span>
                <span className="flex items-center gap-3 text-[12px] text-gray-400 group-hover:text-gray-500 transition-colors">
                  {item.meta}
                  <ArrowRight
                    size={14}
                    strokeWidth={1.2}
                    className="opacity-40 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all"
                  />
                </span>
              </button>
            ))}
          </nav>

          {/* Spacer to push nav to middle */}
          <div />
        </div>

        {/* ── Right column — carousel ── */}
        <div className="hidden md:block md:w-[58%] relative overflow-hidden bg-[#f0ede8]">
          {images.length > 0 ? (
            <>
              {images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
                  style={{ opacity: i === slide ? 1 : 0 }}
                />
              ))}
              {images.length > 1 && (
                <div className="absolute bottom-8 right-8 flex gap-2 z-10">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSlide(i)}
                      className={`rounded-full transition-all duration-300 ${
                        i === slide
                          ? "w-4 h-1.5 bg-white opacity-100"
                          : "w-1.5 h-1.5 bg-white opacity-40 hover:opacity-70"
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 bg-[#f0ede8]" />
          )}
        </div>
      </div>

      {/* ── Backdrop ── */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-[2px] z-30 transition-opacity duration-300 ${
          drawer ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setDrawer(null)}
      />

      {/* ── Drawer panel — slides out from right edge of left column ── */}
      <div
        className={`fixed top-0 left-[42%] h-full w-[380px] bg-white z-40 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          drawer ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 shrink-0">
          <span className="text-[15px]">
            {drawer ? drawerTitle[drawer] : ""}
          </span>
          <button
            onClick={() => setDrawer(null)}
            className="p-1 text-gray-400 hover:text-black transition-colors"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Drawer body */}
        <div className="flex-1 overflow-y-auto px-8 py-10">

          {drawer === "orders" && (
            <>
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <p className="text-[14px] text-gray-400 mb-8">
                    {locale === "mn" ? "Захиалга байхгүй байна" : "You haven't placed any orders yet"}
                  </p>
                  <Link
                    href={`/${locale}/store`}
                    onClick={() => setDrawer(null)}
                    className="inline-block border border-black rounded-full px-6 py-2.5 text-[12px] tracking-wide hover:bg-black hover:text-white transition-colors"
                  >
                    {locale === "mn" ? "Дэлгүүрлэх" : "Shop now"}
                  </Link>
                </div>
              ) : (
                <div className="space-y-0">
                  <div className="grid grid-cols-[1fr_auto_auto] gap-4 pb-3 text-[11px] uppercase tracking-widest text-gray-400 border-b border-gray-100">
                    <span>{locale === "mn" ? "Захиалга" : "Order"}</span>
                    <span>{locale === "mn" ? "Төлөв" : "Status"}</span>
                    <span className="text-right">{locale === "mn" ? "Нийт" : "Total"}</span>
                  </div>
                  {orders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/${locale}/account/orders/${order.id}`}
                      onClick={() => setDrawer(null)}
                      className="grid grid-cols-[1fr_auto_auto] gap-4 py-4 border-b border-gray-50 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
                    >
                      <div>
                        <p className="text-[12px] font-mono text-gray-700">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString(
                            locale === "mn" ? "mn-MN" : "en-US"
                          )}
                        </p>
                      </div>
                      <StatusBadge
                        status={order.status as Parameters<typeof StatusBadge>[0]["status"]}
                        label={order.status}
                      />
                      <span className="text-[13px] text-right">
                        {formatPrice(order.total, locale as "mn" | "en")}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {drawer === "addresses" && (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <p className="text-[14px] text-gray-400">
                {locale === "mn" ? "Хадгалагдсан хаяг байхгүй" : "No saved addresses yet"}
              </p>
            </div>
          )}

          {drawer === "settings" && (
            <div className="space-y-10">
              {/* Profile fields */}
              <section>
                <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-6">
                  {locale === "mn" ? "Хувийн мэдээлэл" : "Personal information"}
                </p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label={locale === "mn" ? "Овог" : "Last name"}
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                    <Input
                      label={locale === "mn" ? "Нэр" : "First name"}
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <Input
                    label={locale === "mn" ? "Имэйл" : "Email"}
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-gray-50 text-gray-400 cursor-not-allowed"
                    onChange={() => {}}
                  />
                </div>

                {saveMsg && (
                  <p className={`text-[12px] mt-4 ${saveMsg.type === "success" ? "text-green-600" : "text-red-500"}`}>
                    {saveMsg.text}
                  </p>
                )}

                <div className="mt-6">
                  <Button variant="solid" size="md" onClick={handleSave} disabled={saving}>
                    {saving ? "..." : locale === "mn" ? "Хадгалах" : "Save"}
                  </Button>
                </div>
              </section>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Logout */}
              <section>
                <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-4">
                  {locale === "mn" ? "Гарах" : "Session"}
                </p>
                <p className="text-[13px] text-gray-500 mb-6">
                  {locale === "mn"
                    ? "Системээс гарахад бүх нэвтрэлт дуусгавар болно."
                    : "Signing out will end your current session."}
                </p>
                <Button variant="outline" size="md" onClick={handleLogout} disabled={loggingOut}>
                  {loggingOut ? "..." : locale === "mn" ? "Гарах" : "Sign out"}
                </Button>
              </section>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
