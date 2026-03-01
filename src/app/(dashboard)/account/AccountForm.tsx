"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type User = { id: string; email: string | null; name: string | null };

export function AccountForm({ user }: { user: User }) {
  const [name, setName] = useState(user.name ?? "");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="text-sm font-medium text-gray-900">Profile</div>
      </div>
      <div className="px-6 py-4">
        <p className="mb-4 text-sm text-gray-500">{user.email}</p>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setSaved(false);
            try {
              const res = await fetch("/api/admin/account", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
              });
              if (res.ok) setSaved(true);
            } finally {
              setLoading(false);
            }
          }}
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
          {saved && <p className="text-xs text-green-600">Saved.</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </form>
      </div>
    </div>
  );
}
