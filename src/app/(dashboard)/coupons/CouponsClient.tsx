"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import {
  useCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  type Coupon,
} from "./hooks/use-coupons";

function toDatetimeLocal(d: Date | null): string {
  if (!d) return "";
  try {
    return format(new Date(d), "yyyy-MM-dd'T'HH:mm");
  } catch {
    return "";
  }
}

export function CouponsClient({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const { coupons } = useCouponsQuery(initialCoupons);
  const createCoupon = useCreateCouponMutation();
  const updateCoupon = useUpdateCouponMutation();
  const deleteCoupon = useDeleteCouponMutation();
  const [showNew, setShowNew] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [active, setActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editType, setEditType] = useState<"percent" | "fixed">("percent");
  const [editValue, setEditValue] = useState("");
  const [editMinOrder, setEditMinOrder] = useState("");
  const [editMaxUses, setEditMaxUses] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const saving = createCoupon.isPending || updateCoupon.isPending;

  function create() {
    if (!code.trim()) return;
    createCoupon.mutate(
      {
        code: code.trim(),
        type,
        value: Number(value),
        minOrder: minOrder ? Number(minOrder) : null,
        maxUses: maxUses ? parseInt(maxUses, 10) : null,
        startsAt: startDate ? new Date(startDate).toISOString() : null,
        endsAt: endDate ? new Date(endDate).toISOString() : null,
        active,
      },
      {
        onSuccess: () => {
          setShowNew(false);
          setCode("");
          setValue("");
          setMinOrder("");
          setMaxUses("");
          setStartDate("");
          setEndDate("");
        },
      }
    );
  }

  function handleConfirmDelete() {
    if (!deleteTargetId) return;
    deleteCoupon.mutate(deleteTargetId, { onSuccess: () => setDeleteTargetId(null) });
  }

  function startEdit(c: Coupon) {
    setEditingId(c.id);
    setEditCode(c.code);
    setEditType(c.type as "percent" | "fixed");
    setEditValue(String(c.value));
    setEditMinOrder(c.minOrder != null ? String(c.minOrder) : "");
    setEditMaxUses(c.maxUses != null ? String(c.maxUses) : "");
    setEditStartDate(toDatetimeLocal(c.startsAt));
    setEditEndDate(toDatetimeLocal(c.endsAt));
    setEditActive(c.active);
  }

  function saveEdit(id: string) {
    if (!editCode.trim()) return;
    updateCoupon.mutate(
      {
        id,
        code: editCode.trim(),
        type: editType,
        value: Number(editValue),
        minOrder: editMinOrder ? Number(editMinOrder) : null,
        maxUses: editMaxUses ? parseInt(editMaxUses, 10) : null,
        startsAt: editStartDate ? new Date(editStartDate).toISOString() : null,
        endsAt: editEndDate ? new Date(editEndDate).toISOString() : null,
        active: editActive,
      },
      { onSuccess: () => setEditingId(null) }
    );
  }

  const inputClass =
    "h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900";

  return (
    <div className="space-y-4">
      <Button type="button" onClick={() => setShowNew(true)}>
        Add coupon
      </Button>
      {showNew && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Code</label>
              <input placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as "percent" | "fixed")} className={inputClass}>
                <option value="percent">Percent</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Value</label>
              <input type="number" placeholder="Value" value={value} onChange={(e) => setValue(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Min order</label>
              <input type="number" placeholder="Min order" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Max uses</label>
              <input type="number" placeholder="Max uses" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Start date (optional)</label>
              <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">End date (optional)</label>
              <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
              <span className="text-xs font-medium text-gray-700">Active</span>
            </label>
            <Button type="button" onClick={create} disabled={saving}>
              Create
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowNew(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="h-12 px-4 text-left">Code</th>
                <th className="h-12 px-4 text-left">Type</th>
                <th className="h-12 px-4 text-right">Value</th>
                <th className="h-12 px-4 text-right">Used</th>
                <th className="h-12 px-4 text-left">Active</th>
                <th className="h-12 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50">
                  {editingId === c.id ? (
                    <>
                      <td className="px-4 py-2"><input value={editCode} onChange={(e) => setEditCode(e.target.value)} className={inputClass} placeholder="Code" /></td>
                      <td className="px-4 py-2">
                        <select value={editType} onChange={(e) => setEditType(e.target.value as "percent" | "fixed")} className={inputClass}>
                          <option value="percent">Percent</option>
                          <option value="fixed">Fixed</option>
                        </select>
                      </td>
                      <td className="px-4 py-2"><input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} className={inputClass} /></td>
                      <td className="px-4 py-2 text-right text-gray-500">{c.usedCount}{c.maxUses != null ? ` / ${c.maxUses}` : ""}</td>
                      <td className="px-4 py-2">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
                          <span className="text-xs">Active</span>
                        </label>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <input type="number" placeholder="Min order" value={editMinOrder} onChange={(e) => setEditMinOrder(e.target.value)} className={`w-20 ${inputClass}`} />
                          <input type="number" placeholder="Max uses" value={editMaxUses} onChange={(e) => setEditMaxUses(e.target.value)} className={`w-20 ${inputClass}`} />
                          <input type="datetime-local" title="Start" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} className={inputClass} />
                          <input type="datetime-local" title="End" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} className={inputClass} />
                          <Button type="button" onClick={() => saveEdit(c.id)} disabled={saving}>Save</Button>
                          <Button type="button" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="h-12 px-4 font-mono font-medium text-gray-900">{c.code}</td>
                      <td className="h-12 px-4 text-gray-700">{c.type}</td>
                      <td className="h-12 px-4 text-right text-gray-900">{c.type === "percent" ? `${Number(c.value)}%` : `৳${Number(c.value)}`}</td>
                      <td className="h-12 px-4 text-right text-gray-700">{c.usedCount}{c.maxUses != null ? ` / ${c.maxUses}` : ""}</td>
                      <td className="h-12 px-4">{c.active ? "Yes" : "No"}</td>
                      <td className="h-12 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="secondary" onClick={() => startEdit(c)}>Edit</Button>
                          <Button type="button" variant="destructive" onClick={() => setDeleteTargetId(c.id)}>Delete</Button>
                        </div>
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
        description="Delete this coupon? This cannot be undone."
        loading={deleteCoupon.isPending}
      />
    </div>
  );
}
