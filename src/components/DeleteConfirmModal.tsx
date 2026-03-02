"use client";

import { useEffect } from "react";
import { Button } from "./ui/Button";
import { AlertTriangle } from "lucide-react";

type DeleteConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
};

export function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Confirm delete",
  description,
  confirmLabel = "Delete",
  loading = false,
}: DeleteConfirmModalProps) {
  async function handleConfirm() {
    await onConfirm();
    onClose();
  }

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => e.key === "Escape" && !loading && onClose();
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, loading, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/30 transition-opacity duration-150"
        aria-hidden
        onClick={loading ? undefined : onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        className="relative w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-lg"
      >
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="delete-modal-title" className="text-sm font-semibold text-gray-900">
              {title}
            </h2>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? "Deleting…" : confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
