"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DropForm } from "@/components/admin/DropForm";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Drop {
  id: string;
  slug: string;
  title_mn: string;
  title_en: string;
  description_mn: string | null;
  description_en: string | null;
  starts_at: string;
  ends_at: string | null;
  is_active: boolean;
}

type DropFormData = {
  title_mn: string;
  title_en: string;
  description_mn: string;
  description_en: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

export default function AdminDropsPage() {
  const params = useParams();
  const locale = (params.locale as string) ?? "mn";
  const supabase = createClient();

  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDrop, setEditingDrop] = useState<Drop | null>(null);

  useEffect(() => {
    fetchDrops();
  }, []);

  async function fetchDrops() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("drops")
      .select("*")
      .order("starts_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setDrops(data ?? []);
    }
    setLoading(false);
  }

  async function handleCreateDrop(data: DropFormData) {
    const slug = slugify(data.title_en) || slugify(data.title_mn) || `drop-${Date.now()}`;

    const { error } = await supabase.from("drops").insert({
      slug,
      title_mn: data.title_mn,
      title_en: data.title_en,
      description_mn: data.description_mn || null,
      description_en: data.description_en || null,
      starts_at: data.starts_at,
      ends_at: data.ends_at || null,
      is_active: data.is_active,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setModalOpen(false);
    await fetchDrops();
  }

  async function handleEditDrop(data: DropFormData) {
    if (!editingDrop) return;

    const { error } = await supabase
      .from("drops")
      .update({
        title_mn: data.title_mn,
        title_en: data.title_en,
        description_mn: data.description_mn || null,
        description_en: data.description_en || null,
        starts_at: data.starts_at,
        ends_at: data.ends_at || null,
        is_active: data.is_active,
      })
      .eq("id", editingDrop.id);

    if (error) {
      alert(error.message);
      return;
    }

    setEditingDrop(null);
    setModalOpen(false);
    await fetchDrops();
  }

  async function toggleActive(drop: Drop) {
    const { error } = await supabase
      .from("drops")
      .update({ is_active: !drop.is_active })
      .eq("id", drop.id);

    if (error) {
      alert(error.message);
      return;
    }

    setDrops((prev) =>
      prev.map((d) => (d.id === drop.id ? { ...d, is_active: !d.is_active } : d))
    );
  }

  function openEdit(drop: Drop) {
    setEditingDrop(drop);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingDrop(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-normal">
          Drops {!loading && `(${drops.length})`}
        </h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 text-[12px] hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
          {locale === "mn" ? "Drop нэмэх" : "New Drop"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-[12px]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : drops.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded p-12 text-center bg-white">
          <p className="text-[15px] text-gray-400">
            {locale === "mn" ? "Drop байхгүй байна" : "No drops yet"}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 overflow-hidden">
          {drops.map((drop) => (
            <div
              key={drop.id}
              className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-b-0"
            >
              <div>
                <p className="text-[13px] font-medium">
                  {locale === "mn" ? drop.title_mn : drop.title_en}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {new Date(drop.starts_at).toLocaleDateString()}{" "}
                  {drop.ends_at && `→ ${new Date(drop.ends_at).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleActive(drop)}
                  title={drop.is_active ? "Идэвхгүй болгох" : "Идэвхжүүлэх"}
                  className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-black"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${drop.is_active ? "bg-green-500" : "bg-gray-300"}`}
                  />
                  {drop.is_active
                    ? locale === "mn" ? "Идэвхтэй" : "Active"
                    : locale === "mn" ? "Идэвхгүй" : "Inactive"}
                </button>
                <button
                  onClick={() => openEdit(drop)}
                  className="text-[11px] hover:underline"
                >
                  {locale === "mn" ? "Засах" : "Edit"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={
          editingDrop
            ? locale === "mn" ? "Drop засах" : "Edit Drop"
            : locale === "mn" ? "Шинэ Drop" : "New Drop"
        }
        size="md"
      >
        <DropForm
          key={editingDrop?.id ?? "new"}
          initialData={
            editingDrop
              ? {
                  title_mn: editingDrop.title_mn,
                  title_en: editingDrop.title_en,
                  description_mn: editingDrop.description_mn ?? "",
                  description_en: editingDrop.description_en ?? "",
                  starts_at: editingDrop.starts_at.slice(0, 16),
                  ends_at: editingDrop.ends_at?.slice(0, 16) ?? "",
                  is_active: editingDrop.is_active,
                }
              : undefined
          }
          onSubmit={editingDrop ? handleEditDrop : handleCreateDrop}
          locale={locale}
        />
      </Modal>
    </div>
  );
}
