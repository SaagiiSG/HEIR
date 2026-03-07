"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { saveSiteSettings, type SiteSettings } from "@/lib/actions/settings";

interface SettingsFormProps {
  initialSettings: SiteSettings;
  locale: string;
}

export function SettingsForm({ initialSettings, locale }: SettingsFormProps) {
  const isMn = locale === "mn";

  const hasInitialAnnouncement =
    initialSettings.announcement_mn.trim().length > 0 ||
    initialSettings.announcement_en.trim().length > 0;

  const [announcementEnabled, setAnnouncementEnabled] = useState(hasInitialAnnouncement);
  const [announcementMn, setAnnouncementMn] = useState(initialSettings.announcement_mn);
  const [announcementEn, setAnnouncementEn] = useState(initialSettings.announcement_en);
  const [shippingFee, setShippingFee] = useState(String(initialSettings.shipping_fee));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Which language the preview shows
  const previewText = isMn ? announcementMn : announcementEn;

  function handleToggle() {
    const next = !announcementEnabled;
    setAnnouncementEnabled(next);
    setStatus("idle");
  }

  async function handleSave() {
    setSaving(true);
    setStatus("idle");

    const result = await saveSiteSettings({
      announcement_mn: announcementEnabled ? announcementMn : "",
      announcement_en: announcementEnabled ? announcementEn : "",
      shipping_fee: Math.max(0, parseInt(shippingFee, 10) || 0),
    });

    setSaving(false);

    if (result.error) {
      setStatus("error");
      setErrorMsg(result.error);
    } else {
      setStatus("saved");
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Announcement Bar ── */}
      <div className="bg-white border border-gray-100 p-6 space-y-5">
        {/* Header row with toggle */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-wide text-gray-500">
            {isMn ? "Мэдэгдлийн мөр" : "Announcement Bar"}
          </p>
          {/* Toggle switch */}
          <button
            type="button"
            role="switch"
            aria-checked={announcementEnabled}
            onClick={handleToggle}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
              announcementEnabled ? "bg-black" : "bg-gray-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${
                announcementEnabled ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <p className="text-[11px] text-gray-400">
          {isMn
            ? "Навигацийн дээр харагдах мэдэгдэл. Идэвхгүй болговол хэрэглэгчдэд харагдахгүй."
            : "Banner shown above the navigation. Disable to hide it from visitors."}
        </p>

        {/* Live preview */}
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            {isMn ? "Урьдчилан харах" : "Preview"}
          </p>
          <div
            className={`h-[34px] flex items-center justify-center text-[11px] tracking-wide px-4 rounded transition-colors ${
              announcementEnabled && previewText.trim()
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-400 italic"
            }`}
          >
            {announcementEnabled && previewText.trim()
              ? previewText
              : isMn
              ? "Мэдэгдэл харагдахгүй байна"
              : "No announcement shown"}
          </div>
        </div>

        {/* Text inputs — shown only when enabled */}
        {announcementEnabled && (
          <div className="space-y-4 pt-1 border-t border-gray-100">
            <Input
              label="Монгол"
              value={announcementMn}
              placeholder="Шинэ цуглуулга нэмэгдлээ..."
              onChange={(e) => { setAnnouncementMn(e.target.value); setStatus("idle"); }}
            />
            <Input
              label="English"
              value={announcementEn}
              placeholder="New collection available..."
              onChange={(e) => { setAnnouncementEn(e.target.value); setStatus("idle"); }}
            />
          </div>
        )}
      </div>

      {/* ── Shipping Fee ── */}
      <div className="bg-white border border-gray-100 p-6 space-y-4">
        <p className="text-[11px] uppercase tracking-wide text-gray-500">
          {isMn ? "Хүргэлтийн тариф" : "Shipping Fee"}
        </p>
        <Input
          label={isMn ? "Үндсэн хүргэлтийн мөнгө (₮)" : "Base Shipping Fee (₮)"}
          type="number"
          min="0"
          step="500"
          value={shippingFee}
          onChange={(e) => { setShippingFee(e.target.value); setStatus("idle"); }}
        />
        <p className="text-[11px] text-gray-400">
          {isMn ? "0 болговол хүргэлт үнэгүй болно" : "Set to 0 for free shipping"}
        </p>
      </div>

      {/* ── Save ── */}
      <div className="flex items-center gap-4">
        <Button variant="solid" size="lg" onClick={handleSave} disabled={saving}>
          {saving ? "..." : isMn ? "Хадгалах" : "Save Settings"}
        </Button>

        {status === "saved" && (
          <p className="text-[12px] text-green-600">
            {isMn ? "Амжилттай хадгалагдлаа" : "Settings saved"}
          </p>
        )}
        {status === "error" && (
          <p className="text-[12px] text-red-500">{errorMsg}</p>
        )}
      </div>
    </div>
  );
}
