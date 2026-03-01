"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type Cat = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parent: { name: string } | null;
  _count: { products: number };
};

const inputClass = "h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900";

export function CategoriesClient({ initialCategories }: { initialCategories: Cat[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [saving, setSaving] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newParentId, setNewParentId] = useState("");

  async function saveEdit(id: string) {
    setSaving(true);
    try {
      await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, parentId: parentId || null }),
      });
      router.refresh();
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  async function create() {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          slug: newSlug || newName.toLowerCase().replace(/\s+/g, "-"),
          parentId: newParentId || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || err.error || "Category create failed. Try again.");
        return;
      }
      router.refresh();
      setShowNew(false);
      setNewName("");
      setNewSlug("");
      setNewParentId("");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this category?")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Button type="button" onClick={() => setShowNew(true)}>
        Add category
      </Button>
      {showNew && (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Name</label>
            <input placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Slug</label>
            <input placeholder="Slug" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Parent</label>
            <select value={newParentId} onChange={(e) => setNewParentId(e.target.value)} className={inputClass}>
              <option value="">No parent</option>
              {initialCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
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
                <th className="h-12 px-4 text-left">Parent</th>
                <th className="h-12 px-4 text-right">Products</th>
                <th className="h-12 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {initialCategories.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50">
                  {editing === c.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input value={name} onChange={(e) => setName(e.target.value)} className={`w-full ${inputClass}`} />
                      </td>
                      <td className="px-4 py-2">
                        <select value={parentId} onChange={(e) => setParentId(e.target.value)} className={inputClass}>
                          <option value="">—</option>
                          {initialCategories.filter((x) => x.id !== c.id).map((x) => (
                            <option key={x.id} value={x.id}>{x.name}</option>
                          ))}
                        </select>
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
                      <td className="h-12 px-4 text-gray-700">{c.parent?.name ?? "—"}</td>
                      <td className="h-12 px-4 text-right text-gray-700">{c._count.products}</td>
                      <td className="h-12 px-4 text-right">
                        <button type="button" onClick={() => { setEditing(c.id); setName(c.name); setSlug(c.slug); setParentId(c.parentId ?? ""); }} className="text-gray-600 hover:text-gray-900">
                          Edit
                        </button>
                        {" · "}
                        <button type="button" onClick={() => remove(c.id)} className="text-red-600 hover:underline">
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
    </div>
  );
}
