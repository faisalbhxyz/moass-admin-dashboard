"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";

export function CustomerActions({ id, email }: { id: string; email: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setShowModal(false);
        router.refresh();
        toast.success("Customer deleted");
      } else toast.error("Failed to delete customer");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/customers/${id}`}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 opacity-0 transition-opacity duration-150 group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-900"
        aria-label="Edit"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); setShowModal(true); }}
        disabled={deleting}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 opacity-0 transition-opacity duration-150 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 disabled:opacity-70"
        aria-label="Delete"
      >
        {deleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </div>
    <DeleteConfirmModal
      open={showModal}
      onClose={() => setShowModal(false)}
      onConfirm={handleConfirmDelete}
      description={`Delete customer ${email}? Orders will be kept but customer link will be removed.`}
      loading={deleting}
    />
    </>
  );
}
