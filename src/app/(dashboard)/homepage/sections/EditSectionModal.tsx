"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useUpdateSectionTitleMutation } from "./hooks/use-homepage-sections";
import type { Section } from "@/types/homepage-sections";

export function EditSectionModal({
  open,
  onClose,
  section,
}: {
  open: boolean;
  onClose: () => void;
  section: Section | null;
}) {
  const [title, setTitle] = useState("");
  const updateTitle = useUpdateSectionTitleMutation(section?.key ?? "");

  useEffect(() => {
    if (section) setTitle(section.title ?? "");
  }, [section]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTitle.mutate(title.trim(), {
      onSuccess: () => onClose(),
    });
  };

  if (!open || !section) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/20" aria-hidden onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl"
      >
        <h3 className="text-lg font-semibold text-gray-900">Edit section</h3>
        <p className="mt-1 text-sm text-gray-500">Key: {section.key} (cannot be changed)</p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Section title"
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateTitle.isPending}>
              {updateTitle.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
