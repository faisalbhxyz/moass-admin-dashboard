"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { ImagePlus, X } from "lucide-react";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import {
  useCategoriesQuery,
  useUpdateCategoryMutation,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  type Category,
} from "./hooks/use-categories";

const inputClass = "h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900";

/** ডক অনুযায়ী: রিলেটিভ পাথ (/api/image/xyz) বা ফুল URL — একই অরিজিনে রিলেটিভ ঠিকঠাক কাজ করে। */
function categoryImageSrc(url: string | null | undefined): string | null {
  if (!url || !url.trim()) return null;
  const u = url.trim();
  if (u.startsWith("http")) return u;
  return u.startsWith("/") ? u : `/${u}`;
}

/** নেম থেকে স্লাগ অটো জেনারেট — স্লাগ হাতে এডিট করার অপশন আলাদা থাকবে। */
function slugFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const { categories } = useCategoriesQuery(initialCategories);
  const updateCat = useUpdateCategoryMutation();
  const createCat = useCreateCategoryMutation();
  const deleteCat = useDeleteCategoryMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [image, setImage] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newParentId, setNewParentId] = useState("");
  const [newImage, setNewImage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const saving = updateCat.isPending || createCat.isPending;

  function saveEdit(id: string) {
    updateCat.mutate(
      {
        id,
        name,
        slug: slug.trim() || slugFromName(name),
        parentId: parentId || null,
        image: image.trim() || null,
      },
      { onSuccess: () => setEditing(null) }
    );
  }

  /** ডক: আপলোড করলে API রেসপন্সে url আসে (/api/image/xyz); ক্যাটাগরি PATCH/POST এ ওই মান সেভ হয়। */
  async function handleImageUpload(
    file: File,
    setter: (url: string) => void
  ) {
    setUploadError("");
    if (!file.type.startsWith("image/")) {
      setUploadError("শুধু ইমেজ ফাইল সাপোর্টেড।");
      return;
    }
    const formData = new FormData();
    formData.set("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        setter(typeof data.url === "string" ? data.url : String(data.url));
      } else {
        setUploadError((data.error as string) || "আপলোড ব্যর্থ।");
      }
    } catch {
      setUploadError("আপলোড ব্যর্থ।");
    }
  }

  function create() {
    if (!newName.trim()) return;
    createCat.mutate(
      {
        name: newName,
        slug: newSlug.trim() || slugFromName(newName),
        parentId: newParentId || null,
        image: newImage.trim() || null,
      },
      {
        onSuccess: () => {
          setShowNew(false);
          setNewName("");
          setNewSlug("");
          setNewParentId("");
          setNewImage("");
          setUploadError("");
        },
        onError: (e) => toast.error(e.message || "Category create failed"),
      }
    );
  }

  function handleConfirmDelete() {
    if (!deleteTargetId) return;
    deleteCat.mutate(deleteTargetId, { onSuccess: () => setDeleteTargetId(null) });
  }

  return (
    <div className="space-y-4">
      <Button type="button" onClick={() => { setShowNew(true); setUploadError(""); }}>
        Add category
      </Button>
      {showNew && (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Name</label>
            <input
              placeholder="Name"
              value={newName}
              onChange={(e) => {
                const v = e.target.value;
                setNewName(v);
                setNewSlug(slugFromName(v));
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Slug (নেম থেকে অটো, এডিট করা যাবে)</label>
            <input placeholder="Slug" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Parent</label>
            <select value={newParentId} onChange={(e) => setNewParentId(e.target.value)} className={inputClass}>
              <option value="">No parent</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="w-full min-w-[220px]">
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-medium text-gray-700">ক্যাটাগরি ইমেজ (optional)</label>
              {newImage.trim() && (
                <button type="button" onClick={() => setNewImage("")} className="text-gray-500 hover:text-red-600" title="Remove image"> <X className="h-3.5 w-3.5" /> </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {categoryImageSrc(newImage) && (
                <img src={categoryImageSrc(newImage)!} alt="" className="h-12 w-12 rounded border border-gray-200 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              )}
              <input
                type="url"
                value={newImage}
                onChange={(e) => { setNewImage(e.target.value); setUploadError(""); }}
                placeholder="/api/image/... অথবা ফুল URL"
                className={`flex-1 min-w-[160px] ${inputClass}`}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageUpload(f, setNewImage);
                  e.target.value = "";
                }}
              />
              <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} title="ইমেজ আপলোড">
                <ImagePlus className="h-4 w-4" />
              </Button>
            </div>
            {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
          </div>
          <Button type="button" onClick={create} disabled={saving}>Create</Button>
          <Button type="button" variant="secondary" onClick={() => setShowNew(false)}>Cancel</Button>
        </div>
      )}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="h-12 px-4 text-left">Name</th>
                <th className="h-12 px-4 text-left">Slug</th>
                <th className="h-12 px-4 text-left">Parent</th>
                <th className="h-12 px-4 text-left">Image</th>
                <th className="h-12 px-4 text-right">Products</th>
                <th className="h-12 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50">
                  {editing === c.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          value={name}
                          onChange={(e) => {
                            const v = e.target.value;
                            setName(v);
                            setSlug(slugFromName(v));
                          }}
                          className={`w-full ${inputClass}`}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          placeholder="Slug"
                          className={`w-full max-w-[140px] ${inputClass}`}
                          title="নেম থেকে অটো, এডিট করা যাবে"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select value={parentId} onChange={(e) => setParentId(e.target.value)} className={inputClass}>
                          <option value="">—</option>
                          {categories.filter((x) => x.id !== c.id).map((x) => (
                            <option key={x.id} value={x.id}>{x.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {categoryImageSrc(image) && (
                            <img src={categoryImageSrc(image)!} alt="" className="h-10 w-10 rounded border object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          )}
                          <input
                            type="url"
                            value={image}
                            onChange={(e) => { setImage(e.target.value); setUploadError(""); }}
                            placeholder="/api/image/... অথবা URL"
                            className={`min-w-[140px] ${inputClass}`}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id={`cat-img-${c.id}`}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleImageUpload(f, setImage);
                              e.target.value = "";
                            }}
                          />
                          <Button type="button" variant="secondary" onClick={() => document.getElementById(`cat-img-${c.id}`)?.click()} title="ইমেজ আপলোড">
                            <ImagePlus className="h-4 w-4" />
                          </Button>
                          {image.trim() && (
                            <button type="button" onClick={() => setImage("")} className="text-gray-500 hover:text-red-600" title="ইমেজ সরান"> <X className="h-4 w-4" /> </button>
                          )}
                        </div>
                        {editing === c.id && uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-700">{c._count.products}</td>
                      <td className="px-4 py-2">
                        <Button type="button" onClick={() => saveEdit(c.id)} disabled={saving}>Save</Button>
                        <Button type="button" variant="ghost" className="ml-2" onClick={() => setEditing(null)}>Cancel</Button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="h-12 px-4 font-medium text-gray-900">{c.name}</td>
                      <td className="h-12 px-4 text-gray-600 font-mono text-xs">{c.slug}</td>
                      <td className="h-12 px-4 text-gray-700">{c.parent?.name ?? "—"}</td>
                      <td className="h-12 px-4">
                        {categoryImageSrc(c.image) ? (
                          <img src={categoryImageSrc(c.image)!} alt="" className="h-10 w-10 rounded border border-gray-200 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="h-12 px-4 text-right text-gray-700">{c._count.products}</td>
                      <td className="h-12 px-4 text-right">
                        <button type="button" onClick={() => { setEditing(c.id); setName(c.name); setSlug(c.slug); setParentId(c.parentId ?? ""); setImage(c.image ?? ""); setUploadError(""); }} className="text-gray-600 hover:text-gray-900">
                          Edit
                        </button>
                        {" · "}
                        <button type="button" onClick={() => setDeleteTargetId(c.id)} className="text-red-600 hover:underline">
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <DeleteConfirmModal
        open={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        description="Delete this category?"
        loading={deleteCat.isPending}
      />
    </div>
  );
}
