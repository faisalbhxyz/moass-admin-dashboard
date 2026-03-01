"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type Coupon = {
  id: string;
  code: string;
  type: string;
  value: { toString(): string };
  minOrder: { toString(): string } | null;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
};

export function CouponsClient({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  async function create() {
    if (!code.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          type,
          value: Number(value),
          minOrder: minOrder ? Number(minOrder) : null,
          maxUses: maxUses ? parseInt(maxUses, 10) : null,
          active,
        }),
      });
      router.refresh();
      setShowNew(false);
      setCode("");
      setValue("");
      setMinOrder("");
      setMaxUses("");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    router.refresh();
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
                <th className="h-12 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {initialCoupons.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50">
                  <td className="h-12 px-4 font-mono font-medium text-gray-900">{c.code}</td>
                  <td className="h-12 px-4 text-gray-700">{c.type}</td>
                  <td className="h-12 px-4 text-right text-gray-900">{c.type === "percent" ? `${Number(c.value)}%` : `৳${Number(c.value)}`}</td>
                  <td className="h-12 px-4 text-right text-gray-700">{c.usedCount}{c.maxUses != null ? ` / ${c.maxUses}` : ""}</td>
                  <td className="h-12 px-4">{c.active ? "Yes" : "No"}</td>
                  <td className="h-12 px-4 text-right">
                    <Button type="button" variant="destructive" onClick={() => remove(c.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
