"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Pencil, Trash2 } from "lucide-react";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { usePagesQuery, useDeletePageMutation, useTogglePageMutation, type PageRow } from "./hooks/use-pages";

export function PagesClient({ initialPages }: { initialPages: PageRow[] }) {
  const { pages } = usePagesQuery(initialPages);
  const deletePage = useDeletePageMutation();
  const togglePage = useTogglePageMutation();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deletePage.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  }

  function toggleActive(id: string, current: boolean) {
    setTogglingId(id);
    togglePage.mutate(
      { id, active: current },
      { onSettled: () => setTogglingId(null) }
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="h-12 px-4 text-left">Title</th>
                <th className="h-12 px-4 text-left">Slug</th>
                <th className="h-12 px-4 text-right">Order</th>
                <th className="h-12 px-4 text-center">Active</th>
                <th className="h-12 px-4 text-right">Updated</th>
                <th className="h-12 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No pages yet. Add Policy, Terms & Conditions, Return Policy, etc.
                  </td>
                </tr>
              ) : (
                pages.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{p.title}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.slug}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{p.sortOrder}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={p.active}
                        disabled={togglingId === p.id}
                        onClick={() => toggleActive(p.id, p.active)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 ${
                          p.active ? "bg-gray-900" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                            p.active ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span className="ml-2 text-xs text-gray-500">{p.active ? "On" : "Off"}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/pages/${p.id}/edit`}>
                          <Button type="button" variant="secondary" className="gap-1">
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          type="button"
                          variant="destructive"
                          className="gap-1"
                          onClick={() => setDeleteTarget({ id: p.id, title: p.title })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        description={deleteTarget ? `Delete "${deleteTarget.title}"?` : ""}
        loading={deletePage.isPending}
      />
      <p className="text-xs text-gray-500">
        Storefront can fetch pages via <code className="rounded bg-gray-100 px-1">GET /api/ecommerce/pages</code> (list) and{" "}
        <code className="rounded bg-gray-100 px-1">GET /api/ecommerce/pages/[slug]</code> (full HTML). See docs for integration.
      </p>
    </div>
  );
}
