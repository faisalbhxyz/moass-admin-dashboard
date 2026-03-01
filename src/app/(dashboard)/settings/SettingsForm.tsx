"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  const [siteName, setSiteName] = useState(initial.site_name ?? "MOASS Store");
  const [currency, setCurrency] = useState(initial.currency ?? "BDT");
  const [lowStockThreshold, setLowStockThreshold] = useState(initial.low_stock_threshold ?? "5");
  const [paymentGateway, setPaymentGateway] = useState(initial.payment_gateway ?? "{}");
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setOk(false);
    try {
      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_name: siteName,
          currency,
          low_stock_threshold: lowStockThreshold,
          payment_gateway: paymentGateway,
        }),
      });
      router.refresh();
      setOk(true);
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900";
  const labelClass = "mb-1 block text-xs font-medium text-gray-700";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="text-sm font-medium text-gray-900">General</div>
        </div>
        <div className="space-y-4 px-6 py-4">
          {ok && <p className="text-xs text-green-600">Saved.</p>}
          <div>
            <label className={labelClass}>Site name</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Currency</label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Low stock threshold</label>
            <input
              type="number"
              min={0}
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Payment gateway (JSON)</label>
            <textarea
              value={paymentGateway}
              onChange={(e) => setPaymentGateway(e.target.value)}
              rows={3}
              className={`min-h-[72px] ${inputClass} py-2 font-mono`}
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </div>
    </form>
  );
}
