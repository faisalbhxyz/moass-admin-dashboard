"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type Section = { id: string; key: string; type: string; title: string | null; sortOrder: number; pinned: boolean };

const inputClass = "h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900";

export function HomepageSectionsClient({ initialSections }: { initialSections: Section[] }) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [key, setKey] = useState("");
  const [type, setType] = useState<"auto" | "manual" | "hybrid">("auto");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  async function create() {
    if (!key.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/admin/homepage/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim(), type, title: title || null }),
      });
      router.refresh();
      setShowNew(false);
      setKey("");
      setTitle("");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this section?")) return;
    await fetch(`/api/admin/homepage/sections/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function togglePinned(id: string, pinned: boolean) {
    await fetch(`/api/admin/homepage/sections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !pinned }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Button type="button" onClick={() => setShowNew(true)}>
        Add section
      </Button>
      {showNew && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Key</label>
              <input placeholder="Key" value={key} onChange={(e) => setKey(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as "auto" | "manual" | "hybrid")} className={inputClass}>
                <option value="auto">Auto</option>
                <option value="manual">Manual</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Title</label>
              <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
            </div>
            <Button type="button" onClick={create} disabled={saving}>Create</Button>
            <Button type="button" variant="secondary" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {initialSections.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-medium text-gray-900">{s.key}</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{s.type}</span>
              {s.pinned && <span className="text-xs text-amber-600">Pinned</span>}
              {s.title && <span className="text-sm text-gray-500">— {s.title}</span>}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => togglePinned(s.id, s.pinned)} className="text-sm text-gray-600 hover:text-gray-900">
                {s.pinned ? "Unpin" : "Pin"}
              </button>
              <button type="button" onClick={() => remove(s.id)} className="text-sm text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
