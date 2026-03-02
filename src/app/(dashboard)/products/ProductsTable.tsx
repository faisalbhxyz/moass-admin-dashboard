"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { ProductActions } from "./ProductActions";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: { toString(): string };
  stock: number;
  published: boolean;
  images: string | null;
  sku: string | null;
  categories: { name: string }[];
};

function buildQuery(params: { page?: number; search?: string }) {
  const q = new URLSearchParams();
  if (params.page && params.page > 1) q.set("page", String(params.page));
  if (params.search?.trim()) q.set("search", params.search.trim());
  const s = q.toString();
  return s ? "?" + s : "";
}

function productImageSrc(images: string | null): string | null {
  if (!images?.trim()) return null;
  const first = images.split(",")[0]?.trim();
  if (!first) return null;
  return first.startsWith("http") ? first : first.startsWith("/") ? first : `/${first}`;
}

export function ProductsTable({
  products,
  currentSearch = "",
  pagination,
}: {
  products: Product[];
  currentSearch?: string;
  pagination: { currentPage: number; totalPages: number; totalCount: number };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchInput, setSearchInput] = useState(currentSearch);

  const applySearch = useCallback(
    (search: string) => {
      const query = buildQuery({ page: 1, search: search.trim() || undefined });
      router.push(pathname + query);
    },
    [pathname, router]
  );

  useEffect(() => setSearchInput(currentSearch), [currentSearch]);
  useEffect(() => {
    if (searchInput === currentSearch) return;
    const t = setTimeout(() => applySearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput, currentSearch, applySearch]);

  return (
    <div className="space-y-4">
      <div className="flex min-w-[220px] max-w-sm items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:border-gray-300 focus-within:ring-1 focus-within:ring-gray-200">
        <Search className="h-4 w-4 shrink-0 text-gray-400" />
        <input
          type="search"
          placeholder="Search by name or SKU..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
          aria-label="Search products"
        />
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="h-12 w-12 px-2 text-left"></th>
                <th className="h-12 px-4 text-left">Name</th>
                <th className="h-12 px-4 text-left">Category</th>
                <th className="h-12 px-4 text-right">Price</th>
                <th className="h-12 px-4 text-right">Stock</th>
                <th className="h-12 px-4 text-left">Status</th>
                <th className="h-12 w-24 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="group border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50">
                  <td className="h-12 px-2">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-gray-100">
                      {productImageSrc(p.images) ? (
                        <img src={productImageSrc(p.images)!} alt="" className="h-10 w-10 object-cover" />
                      ) : null}
                    </div>
                  </td>
                  <td className="h-12 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{p.name}</p>
                      {p.sku && <p className="text-xs text-gray-500">{p.sku}</p>}
                    </div>
                  </td>
                  <td className="h-12 px-4 text-gray-700">{p.categories?.length ? p.categories.map((c) => c.name).join(", ") : "—"}</td>
                  <td className="h-12 px-4 text-right font-medium text-gray-900">৳{Number(p.price).toLocaleString()}</td>
                  <td className="h-12 px-4 text-right text-gray-700">{p.stock}</td>
                  <td className="h-12 px-4">
                    {p.published ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Published</span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Draft</span>
                    )}
                  </td>
                  <td className="h-12 px-2 text-right">
                    <ProductActions id={p.id} name={p.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">No products found.</div>
        )}
        {pagination.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 px-6 py-4">
            <p className="text-sm text-gray-500">
              Page {pagination.currentPage} of {pagination.totalPages} · {pagination.totalCount} total
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={pagination.currentPage <= 1 ? "#" : pathname + buildQuery({ page: pagination.currentPage - 1, search: currentSearch || undefined })}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${pagination.currentPage <= 1 ? "cursor-not-allowed border-gray-200 text-gray-400" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
              >
                ← Previous
              </Link>
              <Link
                href={pagination.currentPage >= pagination.totalPages ? "#" : pathname + buildQuery({ page: pagination.currentPage + 1, search: currentSearch || undefined })}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${pagination.currentPage >= pagination.totalPages ? "cursor-not-allowed border-gray-200 text-gray-400" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
              >
                Next →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
