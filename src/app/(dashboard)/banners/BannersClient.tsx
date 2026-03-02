"use client";

import { useState } from "react";
import { AddBannerModal } from "./AddBannerModal";
import { ImagePlus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { useBannersQuery, useDeleteBannerMutation, type Banner } from "./hooks/use-banners";

export function BannersClient({ initialBanners }: { initialBanners: Banner[] }) {
  const { banners } = useBannersQuery(initialBanners);
  const deleteBanner = useDeleteBannerMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  function handleConfirmDelete() {
    if (!deleteTargetId) return;
    deleteBanner.mutate(deleteTargetId, { onSuccess: () => setDeleteTargetId(null) });
  }

  return (
    <div className="space-y-4">
      <Button type="button" onClick={() => { setEditBanner(null); setModalOpen(true); }}>
        <span className="inline-flex items-center gap-2">
          <ImagePlus className="h-4 w-4" />
          Add banner
        </span>
      </Button>

      <AddBannerModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditBanner(null); }}
        editBanner={editBanner}
      />

      <div className="space-y-3">
        {banners.map((b) => (
          <div
            key={b.id}
            className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-colors duration-150"
          >
            <img
              src={b.image}
              alt={b.title ?? ""}
              className="h-20 w-28 rounded-lg border border-gray-200 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">{b.title ?? "—"}</p>
              <p className="truncate text-xs text-gray-500">{b.link ?? "—"}</p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                b.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
              }`}
            >
              {b.active ? "Active" : "Inactive"}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => { setEditBanner(b); setModalOpen(true); }}
                className="rounded-md p-2 text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-900"
                aria-label="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTargetId(b.id)}
                className="rounded-md p-2 text-gray-500 transition-colors duration-150 hover:bg-red-50 hover:text-red-600"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <DeleteConfirmModal
        open={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        description="Delete this banner?"
        loading={deleteBanner.isPending}
      />
      {banners.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-sm text-gray-500">No banners yet.</p>
          <Button type="button" className="mt-3" onClick={() => setModalOpen(true)}>
            <span className="inline-flex items-center gap-2">
              <ImagePlus className="h-4 w-4" />
              Add banner
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
