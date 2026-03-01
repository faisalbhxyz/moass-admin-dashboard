"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

const inputClass = "h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900";

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOk(false);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: newPass }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed");
        return;
      }
      setOk(true);
      setCurrent("");
      setNewPass("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="text-sm font-medium text-gray-900">Change password</div>
      </div>
      <div className="px-6 py-4">
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <p className="text-xs text-red-500">{error}</p>}
          {ok && <p className="text-xs text-green-600">Password updated.</p>}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Current password</label>
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">New password (min 6)</label>
            <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} required minLength={6} className={inputClass} />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating…" : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
