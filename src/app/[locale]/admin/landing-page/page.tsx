"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import type { LandingPageConfig } from "@/lib/landing-page-types";
import { DEFAULT_CONFIG } from "@/lib/landing-page-types";
import { EditorPanel } from "@/components/admin/landing-page/EditorPanel";
import { LandingPagePreview } from "@/components/admin/landing-page/LandingPagePreview";
import { Check, Loader2, Globe } from "lucide-react";

type SaveStatus = "idle" | "saving" | "saved" | "error";
type PublishStatus = "idle" | "publishing" | "published" | "error";

export default function LandingPageEditorPage() {
  const params = useParams();
  const locale = (params.locale as string) ?? "mn";

  const [config, setConfig] = useState<LandingPageConfig>(DEFAULT_CONFIG);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [publishStatus, setPublishStatus] = useState<PublishStatus>("idle");
  const [loading, setLoading] = useState(true);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingConfigRef = useRef<LandingPageConfig | null>(null);

  // Load draft on mount
  useEffect(() => {
    fetch("/api/admin/landing-page/draft")
      .then((r) => r.json())
      .then((data) => {
        // Merge with DEFAULT_CONFIG so any new keys (e.g. featuredReviews) get defaults
        if (data?.config) {
          const loaded = data.config as LandingPageConfig;
          setConfig({ ...DEFAULT_CONFIG, ...loaded, hero: { ...DEFAULT_CONFIG.hero, ...loaded.hero } });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const saveDraft = useCallback(async (cfg: LandingPageConfig) => {
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/admin/landing-page/draft", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      setSaveStatus(res.ok ? "saved" : "error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, []);

  function handleConfigChange(newConfig: LandingPageConfig) {
    setConfig(newConfig);
    pendingConfigRef.current = newConfig;

    // Debounce auto-save 2s
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (pendingConfigRef.current) {
        saveDraft(pendingConfigRef.current);
        pendingConfigRef.current = null;
      }
    }, 2000);
  }

  async function handleSaveDraft() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pendingConfigRef.current = null;
    await saveDraft(config);
  }

  async function handlePublish() {
    // Flush any pending draft save first
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (pendingConfigRef.current) {
      await saveDraft(pendingConfigRef.current);
      pendingConfigRef.current = null;
    }

    setPublishStatus("publishing");
    try {
      const res = await fetch("/api/admin/landing-page/publish", { method: "POST" });
      if (res.ok) {
        setPublishStatus("published");
        setTimeout(() => setPublishStatus("idle"), 4000);
      } else {
        setPublishStatus("error");
        setTimeout(() => setPublishStatus("idle"), 4000);
      }
    } catch {
      setPublishStatus("error");
      setTimeout(() => setPublishStatus("idle"), 4000);
    }
  }

  if (loading) {
    return (
      <div className="-m-8 flex items-center justify-center bg-gray-50" style={{ height: "calc(100vh - 50px)" }}>
        <p className="text-[13px] text-gray-400">Loading editor...</p>
      </div>
    );
  }

  return (
    // -m-8 cancels the admin layout's p-8 so we fill edge-to-edge
    <div className="-m-8 flex flex-col" style={{ height: "calc(100vh - 50px)" }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-[14px] font-medium">Landing Page Editor</h1>
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Loader2 className="w-3 h-3 animate-spin" strokeWidth={1.5} />
              Saving draft...
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-[11px] text-green-600">
              <Check className="w-3 h-3" strokeWidth={2} />
              Draft saved
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-[11px] text-red-500">Save failed</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            disabled={saveStatus === "saving"}
            className="px-4 py-2 text-[11px] border border-gray-200 hover:border-black transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={handlePublish}
            disabled={publishStatus === "publishing"}
            className="flex items-center gap-1.5 px-4 py-2 text-[11px] bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {publishStatus === "publishing" ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" strokeWidth={1.5} />
                Publishing...
              </>
            ) : publishStatus === "published" ? (
              <>
                <Check className="w-3 h-3" strokeWidth={2} />
                Published!
              </>
            ) : (
              <>
                <Globe className="w-3 h-3" strokeWidth={1.5} />
                Publish
              </>
            )}
          </button>
          {publishStatus === "error" && (
            <span className="text-[11px] text-red-500">Publish failed</span>
          )}
        </div>
      </div>

      {/* Split view */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Editor panel */}
        <div className="w-[380px] shrink-0 border-r border-gray-100 bg-white flex flex-col overflow-hidden">
          <EditorPanel config={config} onChange={handleConfigChange} />
        </div>

        {/* Right: Live preview */}
        <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-white shrink-0">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Preview</span>
            <span className="text-[10px] text-gray-300">— updates as you edit</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div
              className="h-full overflow-y-auto"
              style={{ transform: "scale(0.75)", transformOrigin: "top left", width: "133.33%", height: "133.33%" }}
            >
              <div className="bg-white min-h-full shadow-sm">
                <LandingPagePreview config={config} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
