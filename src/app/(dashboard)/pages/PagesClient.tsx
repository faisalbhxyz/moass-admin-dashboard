"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Pencil, Trash2 } from "lucide-react";

type PageRow = {
  id: string;
  slug: string;
  title: string;
  sortOrder: number;
  updatedAt: Date;
};

export function PagesClient({ initialPages }: { initialPages: PageRow[] }) {
  const router = useRouter();

  async function remove(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
    router.refresh();
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
                <th className="h-12 px-4 text-right">Updated</th>
                <th className="h-12 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialPages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No pages yet. Add Policy, Terms & Conditions, Return Policy, etc.
                  </td>
                </tr>
              ) : (
                initialPages.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{p.title}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.slug}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{p.sortOrder}</td>
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
                          onClick={() => remove(p.id, p.title)}
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
      <p className="text-xs text-gray-500">
        Storefront can fetch pages via <code className="rounded bg-gray-100 px-1">GET /api/ecommerce/pages</code> (list) and{" "}
        <code className="rounded bg-gray-100 px-1">GET /api/ecommerce/pages/[slug]</code> (full HTML). See docs for integration.
      </p>
    </div>
  );
}
