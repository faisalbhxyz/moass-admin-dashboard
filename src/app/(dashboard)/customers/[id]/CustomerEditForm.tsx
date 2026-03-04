"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type Customer = { id: string; email: string | null; name: string | null; phone: string | null; address: string | null };

export function CustomerEditForm({ customer }: { customer: Customer }) {
  const router = useRouter();
  const [name, setName] = useState(customer.name ?? "");
  const [phone, setPhone] = useState(customer.phone ?? "");
  const [address, setAddress] = useState(customer.address ?? "");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`/api/admin/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || null, phone: phone || null, address: address || null }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900";
  const labelClass = "mb-1 block text-xs font-medium text-gray-700";

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-4">
      <p className="w-full text-sm text-gray-500">{customer.email ?? customer.phone ?? "—"}</p>
      <div className="min-w-[160px]">
        <label className={labelClass}>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </div>
      <div className="min-w-[160px]">
        <label className={labelClass}>Phone</label>
        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
      </div>
      <div className="min-w-[200px] flex-1">
        <label className={labelClass}>Address</label>
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
