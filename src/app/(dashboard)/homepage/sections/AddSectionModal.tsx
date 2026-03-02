"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCreateSectionMutation } from "./hooks/use-homepage-sections";

export function AddSectionModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [key, setKey] = useState("");
  const [title, setTitle] = useState("");
  const createSection = useCreateSectionMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const k = key.trim().toLowerCase().replace(/\s+/g, "_");
    if (!k) return;
    createSection.mutate(
      { key: k, title: title.trim() || undefined },
      {
        onSuccess: () => {
          setKey("");
          setTitle("");
          onClose();
        },
      }
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/20" aria-hidden onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl"
      >
        <h3 className="text-lg font-semibold text-gray-900">Add new section</h3>
        <p className="mt-1 text-sm text-gray-500">
          Key: lowercase letters, numbers, underscore only (e.g. flash_sale, trending).
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Key</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. flash_sale"
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Flash Sale"
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createSection.isPending || !key.trim()}>
              {createSection.isPending ? "Adding…" : "Add section"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
