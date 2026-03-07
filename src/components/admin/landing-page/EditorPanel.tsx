"use client";

import { useState, useEffect, useRef } from "react";
import { X, Star, Plus, Check, Loader2, ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import type { LandingPageConfig, NewInSlot, CollectionSlot, FeaturedReview, FaqItem } from "@/lib/landing-page-types";
import { ProductPicker } from "./ProductPicker";
import { CollectionSlotModal } from "./CollectionSlotModal";
import { ReviewPicker } from "./ReviewPicker";
import { ImageUploadField } from "./ImageUploadField";

type Section = "hero" | "newIn" | "exclusive" | "collections" | "reviews" | "faq" | "announcement";

interface EditorPanelProps {
  config: LandingPageConfig;
  onChange: (config: LandingPageConfig) => void;
}

interface PickerProduct {
  id: string;
  slug: string;
  name_en: string;
  name_mn: string;
  base_price: number;
  compare_at_price: number | null;
  primaryImageUrl: string;
  colorSwatches: string[];
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3 h-3 ${n <= rating ? "fill-black text-black" : "text-gray-200"}`}
          strokeWidth={1}
        />
      ))}
    </div>
  );
}

export function EditorPanel({ config, onChange }: EditorPanelProps) {
  const [activeSection, setActiveSection] = useState<Section>("hero");

  // New In picker
  const [newInPickerIndex, setNewInPickerIndex] = useState<number | null>(null);

  // Collection slot modal
  const [collectionModalIndex, setCollectionModalIndex] = useState<number | null>(null);

  // Review picker
  const [reviewPickerOpen, setReviewPickerOpen] = useState(false);

  const TABS: { key: Section; label: string }[] = [
    { key: "hero", label: "Hero" },
    { key: "newIn", label: "New In" },
    { key: "exclusive", label: "Heir Exclusive" },
    { key: "collections", label: "Collections" },
    { key: "reviews", label: "Reviews" },
    { key: "faq", label: "FAQ" },
    { key: "announcement", label: "Announcement" },
  ];

  // ── Announcement state (separate from landing page config) ──
  const [announcementMn, setAnnouncementMn] = useState("");
  const [announcementEn, setAnnouncementEn] = useState("");
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [announcementSaving, setAnnouncementSaving] = useState(false);
  const [announcementStatus, setAnnouncementStatus] = useState<"idle" | "saved" | "error">("idle");
  const announcementFetched = useRef(false);

  useEffect(() => {
    if (activeSection !== "announcement" || announcementFetched.current) return;
    announcementFetched.current = true;
    setAnnouncementLoading(true);
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setAnnouncementMn(data.announcement_mn ?? "");
        setAnnouncementEn(data.announcement_en ?? "");
        setAnnouncementEnabled(
          (data.announcement_mn ?? "").trim().length > 0 ||
          (data.announcement_en ?? "").trim().length > 0
        );
      })
      .catch(console.error)
      .finally(() => setAnnouncementLoading(false));
  }, [activeSection]);

  async function handleSaveAnnouncement() {
    setAnnouncementSaving(true);
    setAnnouncementStatus("idle");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          announcement_mn: announcementEnabled ? announcementMn : "",
          announcement_en: announcementEnabled ? announcementEn : "",
        }),
      });
      setAnnouncementStatus(res.ok ? "saved" : "error");
    } catch {
      setAnnouncementStatus("error");
    } finally {
      setAnnouncementSaving(false);
      setTimeout(() => setAnnouncementStatus("idle"), 3000);
    }
  }

  // ── Hero ──
  function updateHero(field: keyof LandingPageConfig["hero"], value: string) {
    onChange({ ...config, hero: { ...config.hero, [field]: value } });
  }

  // ── New In ──
  function updateNewInSlot(index: number, slot: NewInSlot) {
    const newIn = [...config.newIn];
    newIn[index] = slot;
    onChange({ ...config, newIn });
  }

  function clearNewInSlot(index: number) {
    const newIn = [...config.newIn];
    newIn[index] = {
      productId: null,
      productName_en: "Coming Soon",
      productName_mn: "Удахгүй нэмэгдэнэ",
      productPrice: 0,
      productImageUrl: "https://placehold.co/400x400/f5f5f5/f5f5f5",
      productSlug: "",
      colorSwatches: [],
    };
    onChange({ ...config, newIn });
  }

  function handleProductSelect(product: PickerProduct) {
    if (newInPickerIndex === null) return;
    updateNewInSlot(newInPickerIndex, {
      productId: product.id,
      productName_en: product.name_en,
      productName_mn: product.name_mn,
      productPrice: product.base_price,
      productCompareAtPrice: product.compare_at_price ?? null,
      productImageUrl: product.primaryImageUrl,
      productSlug: product.slug,
      colorSwatches: product.colorSwatches,
    });
    setNewInPickerIndex(null);
  }

  // ── Heir Exclusive ──
  const [exclusivePickerIndex, setBestSellerPickerIndex] = useState<number | null>(null);
  const exclusive = config.exclusive ?? [];

  function updateBestSellerSlot(index: number, slot: NewInSlot) {
    const updated = [...exclusive];
    updated[index] = slot;
    onChange({ ...config, exclusive: updated });
  }

  function clearBestSellerSlot(index: number) {
    const updated = [...exclusive];
    updated[index] = {
      productId: null,
      productName_en: "Coming Soon",
      productName_mn: "Удахгүй нэмэгдэнэ",
      productPrice: 0,
      productImageUrl: "https://placehold.co/400x400/f5f5f5/f5f5f5",
      productSlug: "",
      colorSwatches: [],
    };
    onChange({ ...config, exclusive: updated });
  }

  function handleBestSellerSelect(product: PickerProduct) {
    if (exclusivePickerIndex === null) return;
    updateBestSellerSlot(exclusivePickerIndex, {
      productId: product.id,
      productName_en: product.name_en,
      productName_mn: product.name_mn,
      productPrice: product.base_price,
      productCompareAtPrice: product.compare_at_price ?? null,
      productImageUrl: product.primaryImageUrl,
      productSlug: product.slug,
      colorSwatches: product.colorSwatches,
    });
    setBestSellerPickerIndex(null);
  }

  // ── Collections ──
  function handleCollectionSave(index: number, slot: CollectionSlot) {
    const collections = [...config.collections];
    collections[index] = slot;
    onChange({ ...config, collections });
  }

  // ── Reviews ──
  function addFeaturedReview(review: FeaturedReview) {
    const featuredReviews = [...(config.featuredReviews ?? []), review];
    onChange({ ...config, featuredReviews });
  }

  function removeFeaturedReview(reviewId: string) {
    const featuredReviews = (config.featuredReviews ?? []).filter((r) => r.reviewId !== reviewId);
    onChange({ ...config, featuredReviews });
  }

  // ── FAQ ──
  const faq = config.faq ?? [];

  function addFaqItem() {
    const newItem: FaqItem = {
      id: Date.now().toString(),
      question_en: "",
      question_mn: "",
      answer_en: "",
      answer_mn: "",
    };
    onChange({ ...config, faq: [...faq, newItem] });
  }

  function updateFaqItem(id: string, patch: Partial<FaqItem>) {
    onChange({ ...config, faq: faq.map((item) => item.id === id ? { ...item, ...patch } : item) });
  }

  function removeFaqItem(id: string) {
    onChange({ ...config, faq: faq.filter((item) => item.id !== id) });
  }

  function moveFaqItem(id: string, dir: -1 | 1) {
    const idx = faq.findIndex((item) => item.id === id);
    if (idx < 0) return;
    const next = idx + dir;
    if (next < 0 || next >= faq.length) return;
    const updated = [...faq];
    [updated[idx], updated[next]] = [updated[next], updated[idx]];
    onChange({ ...config, faq: updated });
  }

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Section tabs */}
        <div className="flex border-b border-gray-100 shrink-0 overflow-x-auto scrollbar-hide">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`px-4 py-3 text-[11px] tracking-wide border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeSection === key
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-black"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Section controls */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* ── Hero ── */}
          {activeSection === "hero" && (
            <div className="space-y-4">
              <ImageUploadField
                label="Hero Image"
                value={config.hero.imageUrl}
                onChange={(url) => updateHero("imageUrl", url)}
                aspect="aspect-[4/5]"
                bucket="product-images"
                pathPrefix="landing-page/hero"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">Heading (EN)</label>
                  <textarea
                    rows={3}
                    value={config.hero.heading_en ?? ""}
                    onChange={(e) => updateHero("heading_en", e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2 text-[12px] outline-none focus:border-black transition-colors resize-none"
                    placeholder="New Collection from&#10;Mongolian Men's Fashion"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">Heading (МН)</label>
                  <textarea
                    rows={3}
                    value={config.hero.heading_mn ?? ""}
                    onChange={(e) => updateHero("heading_mn", e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2 text-[12px] outline-none focus:border-black transition-colors resize-none"
                    placeholder="Монгол эрэгтэй загварын&#10;шинэ цуглуулга"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">Subtitle (EN)</label>
                  <input
                    type="text"
                    value={config.hero.subtitle_en ?? ""}
                    onChange={(e) => updateHero("subtitle_en", e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2 text-[12px] outline-none focus:border-black transition-colors"
                    placeholder="Spring / Summer 2026"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">Subtitle (МН)</label>
                  <input
                    type="text"
                    value={config.hero.subtitle_mn ?? ""}
                    onChange={(e) => updateHero("subtitle_mn", e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2 text-[12px] outline-none focus:border-black transition-colors"
                    placeholder="Хавар / Зун 2026"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">CTA Button (EN)</label>
                  <input
                    type="text"
                    value={config.hero.cta_en ?? ""}
                    onChange={(e) => updateHero("cta_en", e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2 text-[12px] outline-none focus:border-black transition-colors"
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">CTA Button (МН)</label>
                  <input
                    type="text"
                    value={config.hero.cta_mn ?? ""}
                    onChange={(e) => updateHero("cta_mn", e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2 text-[12px] outline-none focus:border-black transition-colors"
                    placeholder="Дэлгүүр үзэх"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">Image Alt Text</label>
                <input
                  type="text"
                  value={config.hero.imageAlt}
                  onChange={(e) => updateHero("imageAlt", e.target.value)}
                  className="w-full border border-gray-200 px-3 py-2 text-[12px] outline-none focus:border-black transition-colors"
                />
              </div>
            </div>
          )}

          {/* ── New In ── */}
          {activeSection === "newIn" && (
            <div className="space-y-3">
              <p className="text-[10px] text-gray-400">Click a slot to assign a product from your catalog.</p>
              {config.newIn.map((slot, i) => (
                <div key={i} className="border border-gray-100 p-3 flex gap-3 items-start">
                  <div className="w-12 h-12 bg-[#f5f5f5] shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={slot.productImageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium truncate">
                      {slot.productId ? slot.productName_en : <span className="text-gray-400">Empty slot {i + 1}</span>}
                    </p>
                    {slot.productId && (
                      <div className="flex items-center gap-1.5">
                        {slot.productCompareAtPrice && slot.productCompareAtPrice > slot.productPrice && (
                          <span className="text-[10px] text-gray-400 line-through">₮{slot.productCompareAtPrice.toLocaleString()}</span>
                        )}
                        <span className="text-[10px] text-gray-500">₮{slot.productPrice.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => setNewInPickerIndex(i)}
                      className="text-[10px] border border-gray-200 px-2.5 py-1 hover:border-black transition-colors"
                    >
                      {slot.productId ? "Change" : "Assign"}
                    </button>
                    {slot.productId && (
                      <button
                        onClick={() => clearNewInSlot(i)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Clear slot"
                      >
                        <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Heir Exclusive ── */}
          {activeSection === "exclusive" && (
            <div className="space-y-3">
              <p className="text-[10px] text-gray-400">Pick 4 products to feature in the Heir Exclusive section.</p>
              {exclusive.slice(0, 4).map((slot, i) => (
                <div key={i} className="border border-gray-100 p-3 flex gap-3 items-start">
                  <div className="w-12 h-12 bg-[#f5f5f5] shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={slot.productImageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium truncate">
                      {slot.productId ? slot.productName_en : <span className="text-gray-400">Empty slot {i + 1}</span>}
                    </p>
                    {slot.productId && (
                      <div className="flex items-center gap-1.5">
                        {slot.productCompareAtPrice && slot.productCompareAtPrice > slot.productPrice && (
                          <span className="text-[10px] text-gray-400 line-through">₮{slot.productCompareAtPrice.toLocaleString()}</span>
                        )}
                        <span className="text-[10px] text-gray-500">₮{slot.productPrice.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => setBestSellerPickerIndex(i)}
                      className="text-[10px] border border-gray-200 px-2.5 py-1 hover:border-black transition-colors"
                    >
                      {slot.productId ? "Change" : "Assign"}
                    </button>
                    {slot.productId && (
                      <button
                        onClick={() => clearBestSellerSlot(i)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Clear slot"
                      >
                        <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Collections ── */}
          {activeSection === "collections" && (
            <div className="space-y-2">
              <p className="text-[10px] text-gray-400">Click a slot to pick a category and set the tile image.</p>
              {config.collections.map((col, i) => (
                <button
                  key={i}
                  onClick={() => setCollectionModalIndex(i)}
                  className="w-full flex items-center gap-3 border border-gray-100 p-3 hover:border-black transition-colors group text-left"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 bg-[#f5f5f5] shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={col.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium truncate">{col.label_en || <span className="text-gray-400">Slot {i + 1}</span>}</p>
                    <p className="text-[10px] text-gray-400 truncate">{col.label_mn}</p>
                    {col.slug && (
                      <p className="text-[9px] text-blue-400 mt-0.5">↳ {col.slug}</p>
                    )}
                  </div>

                  <span className="text-[10px] text-gray-400 group-hover:text-black transition-colors shrink-0">
                    Edit →
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* ── FAQ ── */}
          {activeSection === "faq" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-gray-400">{faq.length} items</p>
                <button
                  onClick={addFaqItem}
                  className="flex items-center gap-1 text-[11px] border border-gray-200 px-3 py-1.5 hover:border-black transition-colors"
                >
                  <Plus className="w-3 h-3" strokeWidth={1.5} />
                  Add Question
                </button>
              </div>

              {faq.length === 0 ? (
                <div className="border border-dashed border-gray-200 p-8 text-center">
                  <p className="text-[12px] text-gray-400 mb-1">No FAQ items yet</p>
                  <p className="text-[10px] text-gray-300">Click "Add Question" to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {faq.map((item, i) => (
                    <div key={item.id} className="border border-gray-100">
                      {/* Item header */}
                      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
                        <GripVertical className="w-3.5 h-3.5 text-gray-300 shrink-0" strokeWidth={1.5} />
                        <p className="flex-1 text-[11px] font-medium truncate text-gray-700">
                          {item.question_en || <span className="text-gray-400 font-normal">Question {i + 1}</span>}
                        </p>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => moveFaqItem(item.id, -1)}
                            disabled={i === 0}
                            className="p-0.5 text-gray-400 hover:text-black disabled:opacity-20 transition-colors"
                          >
                            <ChevronUp className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => moveFaqItem(item.id, 1)}
                            disabled={i === faq.length - 1}
                            className="p-0.5 text-gray-400 hover:text-black disabled:opacity-20 transition-colors"
                          >
                            <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => removeFaqItem(item.id)}
                            className="p-0.5 text-gray-300 hover:text-red-500 transition-colors ml-1"
                          >
                            <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>

                      {/* Fields */}
                      <div className="p-3 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] uppercase tracking-wide text-gray-400 mb-1">Question (EN)</label>
                            <input
                              type="text"
                              value={item.question_en}
                              onChange={(e) => updateFaqItem(item.id, { question_en: e.target.value })}
                              placeholder="Question in English"
                              className="w-full border border-gray-200 px-2 py-1.5 text-[11px] outline-none focus:border-black transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase tracking-wide text-gray-400 mb-1">Question (МН)</label>
                            <input
                              type="text"
                              value={item.question_mn}
                              onChange={(e) => updateFaqItem(item.id, { question_mn: e.target.value })}
                              placeholder="Монгол дахь асуулт"
                              className="w-full border border-gray-200 px-2 py-1.5 text-[11px] outline-none focus:border-black transition-colors"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] uppercase tracking-wide text-gray-400 mb-1">Answer (EN)</label>
                            <textarea
                              value={item.answer_en}
                              onChange={(e) => updateFaqItem(item.id, { answer_en: e.target.value })}
                              placeholder="Answer in English"
                              rows={3}
                              className="w-full border border-gray-200 px-2 py-1.5 text-[11px] outline-none focus:border-black transition-colors resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase tracking-wide text-gray-400 mb-1">Answer (МН)</label>
                            <textarea
                              value={item.answer_mn}
                              onChange={(e) => updateFaqItem(item.id, { answer_mn: e.target.value })}
                              placeholder="Монгол дахь хариулт"
                              rows={3}
                              className="w-full border border-gray-200 px-2 py-1.5 text-[11px] outline-none focus:border-black transition-colors resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Announcement ── */}
          {activeSection === "announcement" && (
            <div className="space-y-5">
              {announcementLoading ? (
                <div className="flex items-center gap-2 text-[11px] text-gray-400 py-4">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
                  Loading...
                </div>
              ) : (
                <>
                  {/* Toggle row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium">Show announcement bar</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Appears above the navigation</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={announcementEnabled}
                      onClick={() => { setAnnouncementEnabled((v) => !v); setAnnouncementStatus("idle"); }}
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

                  {/* Live preview */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5">Preview</p>
                    <div
                      className={`h-[34px] flex items-center justify-center text-[11px] tracking-wide px-4 rounded transition-colors ${
                        announcementEnabled && announcementMn.trim()
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-400 italic"
                      }`}
                    >
                      {announcementEnabled && announcementMn.trim()
                        ? announcementMn
                        : "No announcement shown"}
                    </div>
                  </div>

                  {/* Text inputs */}
                  {announcementEnabled && (
                    <div className="space-y-3 pt-1 border-t border-gray-100">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">Монгол</label>
                        <input
                          type="text"
                          value={announcementMn}
                          onChange={(e) => { setAnnouncementMn(e.target.value); setAnnouncementStatus("idle"); }}
                          placeholder="Шинэ цуглуулга нэмэгдлээ..."
                          className="w-full border border-gray-200 px-3 py-2 text-[12px] outline-none focus:border-black transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">English</label>
                        <input
                          type="text"
                          value={announcementEn}
                          onChange={(e) => { setAnnouncementEn(e.target.value); setAnnouncementStatus("idle"); }}
                          placeholder="New collection available..."
                          className="w-full border border-gray-200 px-3 py-2 text-[12px] outline-none focus:border-black transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {/* Save button */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={handleSaveAnnouncement}
                      disabled={announcementSaving}
                      className="flex items-center gap-1.5 px-4 py-2 text-[11px] bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {announcementSaving ? (
                        <><Loader2 className="w-3 h-3 animate-spin" strokeWidth={1.5} /> Saving...</>
                      ) : (
                        "Save"
                      )}
                    </button>
                    {announcementStatus === "saved" && (
                      <span className="flex items-center gap-1 text-[11px] text-green-600">
                        <Check className="w-3 h-3" strokeWidth={2} /> Saved
                      </span>
                    )}
                    {announcementStatus === "error" && (
                      <span className="text-[11px] text-red-500">Save failed</span>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Reviews ── */}
          {activeSection === "reviews" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-gray-400">
                  {(config.featuredReviews ?? []).length}/6 reviews selected
                </p>
                <button
                  onClick={() => setReviewPickerOpen(true)}
                  disabled={(config.featuredReviews ?? []).length >= 6}
                  className="flex items-center gap-1 text-[11px] border border-gray-200 px-3 py-1.5 hover:border-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3 h-3" strokeWidth={1.5} />
                  Add Review
                </button>
              </div>

              {(config.featuredReviews ?? []).length === 0 ? (
                <div className="border border-dashed border-gray-200 p-8 text-center">
                  <p className="text-[12px] text-gray-400 mb-1">No reviews selected yet</p>
                  <p className="text-[10px] text-gray-300">Click "Add Review" to curate reviews for the landing page</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(config.featuredReviews ?? []).map((review) => (
                    <div
                      key={review.reviewId}
                      className="border border-gray-100 p-3 flex gap-3 items-start"
                    >
                      <div className="flex-1 min-w-0">
                        <StarRow rating={review.rating} />
                        {review.title && (
                          <p className="text-[11px] font-medium mt-1.5">{review.title}</p>
                        )}
                        <p className="text-[10px] text-gray-500 leading-[1.5] mt-1 line-clamp-2">
                          &ldquo;{review.content}&rdquo;
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-medium">{review.reviewerName}</span>
                          {review.productName_en && (
                            <span className="text-[10px] text-gray-400">· {review.productName_en}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFeaturedReview(review.reviewId)}
                        className="text-gray-300 hover:text-red-500 transition-colors shrink-0 mt-0.5"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Product picker modal */}
      {newInPickerIndex !== null && (
        <ProductPicker
          onSelect={handleProductSelect}
          onClose={() => setNewInPickerIndex(null)}
        />
      )}

      {/* Best sellers product picker */}
      {exclusivePickerIndex !== null && (
        <ProductPicker
          onSelect={handleBestSellerSelect}
          onClose={() => setBestSellerPickerIndex(null)}
        />
      )}

      {/* Collection slot modal */}
      {collectionModalIndex !== null && (
        <CollectionSlotModal
          slotIndex={collectionModalIndex}
          slot={config.collections[collectionModalIndex]}
          onSave={handleCollectionSave}
          onClose={() => setCollectionModalIndex(null)}
        />
      )}

      {/* Review picker modal */}
      {reviewPickerOpen && (
        <ReviewPicker
          alreadySelected={(config.featuredReviews ?? []).map((r) => r.reviewId)}
          onSelect={addFeaturedReview}
          onClose={() => setReviewPickerOpen(false)}
        />
      )}
    </>
  );
}
