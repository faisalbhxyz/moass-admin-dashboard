"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Pencil, Trash2 } from "lucide-react";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import {
  useShippingQuery,
  useCreateZoneMutation,
  useUpdateZoneMutation,
  useDeleteZoneMutation,
  type Zone,
} from "./hooks/use-shipping";

const inputClass = "h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900";

export function ShippingClient({ initialZones }: { initialZones: Zone[] }) {
  const { zones } = useShippingQuery(initialZones);
  const createZone = useCreateZoneMutation();
  const updateZone = useUpdateZoneMutation();
  const deleteZone = useDeleteZoneMutation();
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [regions, setRegions] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRegions, setEditRegions] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const saving = createZone.isPending || updateZone.isPending;

  function create() {
    if (!name.trim() || !price) return;
    createZone.mutate(
      { name, regions: regions || "All", price: Number(price) },
      {
        onSuccess: () => {
          setShowNew(false);
          setName("");
          setRegions("All");
          setPrice("");
        },
      }
    );
  }

  function handleConfirmDelete() {
    if (!deleteTargetId) return;
    deleteZone.mutate(deleteTargetId, { onSuccess: () => setDeleteTargetId(null) });
  }

  function startEdit(z: Zone) {
    setEditingId(z.id);
    setEditName(z.name);
    setEditRegions(z.regions);
    setEditPrice(String(z.price));
  }

  function saveEdit(id: string) {
    if (!editName.trim() || !editPrice) return;
    updateZone.mutate(
      {
        id,
        name: editName.trim(),
        regions: editRegions.trim() || "All",
        price: Number(editPrice),
      },
      { onSuccess: () => setEditingId(null) }
    );
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
        {zones.map((z) => (
          <div key={z.id} className="rounded-lg border border-gray-200 bg-white p-4">
            {editingId === z.id ? (
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Name</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Regions</label>
                  <input value={editRegions} onChange={(e) => setEditRegions(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Price</label>
                  <input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className={inputClass} />
                </div>
                <Button type="button" onClick={() => saveEdit(z.id)} disabled={saving}>Save</Button>
                <Button type="button" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{z.name}</p>
                  <p className="text-xs text-gray-500">{z.regions} — ৳{Number(z.price).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="secondary" onClick={() => startEdit(z)} className="gap-1">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button type="button" variant="destructive" onClick={() => setDeleteTargetId(z.id)} className="gap-1">
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <DeleteConfirmModal
        open={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        description="Delete this shipping zone?"
        loading={deleteZone.isPending}
      />
    </div>
  );
}
