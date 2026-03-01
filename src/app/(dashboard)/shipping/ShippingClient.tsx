"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type Zone = { id: string; name: string; regions: string; price: { toString(): string }; sortOrder: number };

const inputClass = "h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900";

export function ShippingClient({ initialZones }: { initialZones: Zone[] }) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [regions, setRegions] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  async function create() {
    if (!name.trim() || !price) return;
    setSaving(true);
    try {
      await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, regions: regions || "All", price: Number(price) }),
      });
      router.refresh();
      setShowNew(false);
      setName("");
      setRegions("All");
      setPrice("");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this zone?")) return;
    await fetch(`/api/admin/shipping/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Button type="button" onClick={() => setShowNew(true)}>
        Add zone
      </Button>
      {showNew && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Name</label>
              <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Regions</label>
              <input placeholder="Regions" value={regions} onChange={(e) => setRegions(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Price</label>
              <input type="number" step="0.01" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
            </div>
            <Button type="button" onClick={create} disabled={saving}>Create</Button>
            <Button type="button" variant="secondary" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {initialZones.map((z) => (
          <div key={z.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
            <div>
              <p className="text-sm font-medium text-gray-900">{z.name}</p>
              <p className="text-xs text-gray-500">{z.regions} — ৳{Number(z.price).toLocaleString()}</p>
            </div>
            <Button type="button" variant="destructive" onClick={() => remove(z.id)}>Delete</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
