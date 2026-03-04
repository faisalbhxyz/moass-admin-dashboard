"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Copy, ExternalLink, Plus } from "lucide-react";

export type LandingPageRow = {
  id: string;
  productId: string;
  createdAt: Date | string;
  product: { id: string; name: string; slug: string };
};

export type ProductOption = {
  id: string;
  name: string;
  slug: string;
};

export function LandingPagesClient({
  initialLandingPages,
  products,
  storefrontBaseUrl,
}: {
  initialLandingPages: LandingPageRow[];
  products: ProductOption[];
  storefrontBaseUrl: string;
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [saving, setSaving] = useState(false);

  function buildLink(slug: string): string {
    const base = storefrontBaseUrl.replace(/\/$/, "");
    return base ? `${base}/landing/${slug}` : "";
  }

  async function copyLink(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied");
    } catch {
      toast.error("Failed to copy");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error("Select a product");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/landing-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProductId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error ?? "Failed to create");
      }
      toast.success("Landing page created");
      setModalOpen(false);
      setSelectedProductId("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900";
  const labelClass = "mb-1 block text-xs font-medium text-gray-700";

  return (
    <div className="space-y-4">
      <Button type="button" onClick={() => setModalOpen(true)}>
        <span className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create
        </span>
      </Button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Create Landing Page</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className={labelClass}>Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!storefrontBaseUrl && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Set <strong>Storefront base URL</strong> in Settings to generate links.
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="h-12 px-4 text-left">Product</th>
                <th className="h-12 px-4 text-left">Link</th>
                <th className="h-12 px-4 text-right">Created</th>
                <th className="h-12 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialLandingPages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No landing pages yet. Click Create to add one.
                  </td>
                </tr>
              ) : (
                initialLandingPages.map((lp) => {
                  const link = buildLink(lp.product.slug);
                  return (
                    <tr key={lp.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-900">{lp.product.name}</td>
                      <td className="px-4 py-3">
                        {link ? (
                          <span className="flex items-center gap-2">
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="truncate text-gray-600 underline hover:text-gray-900"
                            >
                              {link}
                            </a>
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500">
                        {new Date(lp.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {link && (
                            <>
                              <button
                                type="button"
                                onClick={() => copyLink(link)}
                                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                aria-label="Copy link"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                aria-label="Open link"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Landing page URL format: <code className="rounded bg-gray-100 px-1">/landing/[product-slug]</code>.
        The storefront must implement this route to show product details + checkout form.
      </p>
    </div>
  );
}
