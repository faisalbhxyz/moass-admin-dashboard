"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { CustomerActions } from "./CustomerActions";

type Customer = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  lastLoginAt: Date | string | null;
};

function buildQuery(params: { page?: number; search?: string }) {
  const q = new URLSearchParams();
  if (params.page && params.page > 1) q.set("page", String(params.page));
  if (params.search?.trim()) q.set("search", params.search.trim());
  const s = q.toString();
  return s ? "?" + s : "";
}

export function CustomersTable({
  customers,
  currentSearch = "",
  pagination,
}: {
  customers: Customer[];
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
          placeholder="Search by name or email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
          aria-label="Search customers"
        />
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="h-12 px-4 text-left">Email</th>
                <th className="h-12 px-4 text-left">Name</th>
                <th className="h-12 px-4 text-left">Phone</th>
                <th className="h-12 px-4 text-left">Last login</th>
                <th className="h-12 w-24 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="group border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50">
                  <td className="h-12 px-4 text-gray-900">{c.email}</td>
                  <td className="h-12 px-4 text-gray-700">{c.name ?? "—"}</td>
                  <td className="h-12 px-4 text-gray-700">{c.phone ?? "—"}</td>
                  <td className="h-12 px-4 text-gray-600">
                    {c.lastLoginAt ? format(new Date(c.lastLoginAt), "MMM d, yyyy · h:mm a") : "—"}
                  </td>
                  <td className="h-12 px-2 text-right">
                    <CustomerActions id={c.id} email={c.email} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {customers.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">No customers found.</div>
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
