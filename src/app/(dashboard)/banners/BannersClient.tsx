"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddBannerModal } from "./AddBannerModal";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Banner = {
  id: string;
  title: string | null;
  image: string;
  link: string | null;
  sortOrder: number;
  active: boolean;
};

export function BannersClient({ initialBanners }: { initialBanners: Banner[] }) {
  const router = useRouter();
  const [banners] = useState(initialBanners);
  const [modalOpen, setModalOpen] = useState(false);

  async function remove(id: string) {
    if (!confirm("Delete this banner?")) return;
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Button type="button" onClick={() => setModalOpen(true)}>
        <span className="inline-flex items-center gap-2">
          <ImagePlus className="h-4 w-4" />
          Add banner
        </span>
      </Button>

      <AddBannerModal open={modalOpen} onClose={() => setModalOpen(false)} />

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
            <button
              type="button"
              onClick={() => remove(b.id)}
              className="rounded-md p-2 text-gray-500 transition-colors duration-150 hover:bg-red-50 hover:text-red-600"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
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
