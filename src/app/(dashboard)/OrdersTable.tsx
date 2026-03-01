"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { format } from "date-fns";
import { MoreHorizontal, Package } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

function statusDisplay(status: string): { label: string; variant: string } {
  switch (status) {
    case "delivered":
    case "paid":
      return { label: "Accepted", variant: "accepted" };
    case "pending":
    case "shipped":
      return { label: "Pending", variant: "pending" };
    case "cancelled":
      return { label: "Rejected", variant: "rejected" };
    default:
      return { label: "Completed", variant: "completed" };
  }
}

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  total: { toString(): string };
  createdAt: Date;
  customer: { name: string | null; email: string } | null;
  items: { product: { name: string } }[];
};

export function OrdersTable({
  orders,
  currentStatus = "all",
  summary,
  pagination,
}: {
  orders: Order[];
  currentStatus?: string;
  summary?: { totalOrders: number; newOrders: number; completedOrders: number; cancelledOrders: number };
  pagination?: { currentPage: number; totalPages: number; totalCount: number };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const statusFilters = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const setStatus = (status: string) => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    router.push(pathname + (params.toString() ? "?" + params.toString() : ""));
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Orders", value: summary.totalOrders, bar: "bg-green-500" },
            { label: "New Orders", value: summary.newOrders, bar: "bg-orange-500" },
            { label: "Completed Orders", value: summary.completedOrders, bar: "bg-green-500" },
            { label: "Cancelled Orders", value: summary.cancelledOrders, bar: "bg-red-500" },
          ].map(({ label, value, bar }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className={`mb-2 h-0.5 w-8 rounded-full ${bar}`} />
              <p className="text-2xl font-bold tracking-tight text-gray-900">{value.toLocaleString()}</p>
              <p className="mt-1 text-xs text-gray-500">{label} last 365 days</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <span className="text-sm text-gray-400">Search by name, Order ID...</span>
        </div>
        <select
          value={currentStatus}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
        >
          {statusFilters.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
          01 Jan, 2024 to 31 Dec, 2024
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          More Filter
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="h-12 px-4 text-left">Product Name</th>
                <th className="h-12 px-4 text-left">Customer Name</th>
                <th className="h-12 px-4 text-left">Order Id</th>
                <th className="h-12 px-4 text-left">Amount</th>
                <th className="h-12 px-4 text-left">Status</th>
                <th className="h-12 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const productName = o.items[0]?.product?.name ?? "—";
                const { label, variant } = statusDisplay(o.status);
                return (
                  <tr key={o.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                          <Package className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{productName}</p>
                          <p className="text-xs text-gray-500">Order item</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
                          {(o.customer?.name ?? o.customer?.email ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-gray-900">{o.customer?.name ?? o.customer?.email ?? "—"}</p>
                          <p className="text-xs text-gray-500">Customer</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono font-medium text-gray-900">#{o.orderNumber}</p>
                      <p className="text-xs text-gray-500">{format(o.createdAt, "MMM d, yyyy")}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">৳{Number(o.total).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Paid</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={variant}>{label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/orders/${o.id}`}
                          className="rounded-md px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        >
                          Details
                        </Link>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                          aria-label="More"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">No orders yet.</div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 px-6 py-4">
            <p className="text-sm text-gray-500">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={pagination.currentPage <= 1 ? "#" : `?page=${pagination.currentPage - 1}${currentStatus !== "all" ? `&status=${currentStatus}` : ""}`}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${pagination.currentPage <= 1 ? "cursor-not-allowed border-gray-200 text-gray-400" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
              >
                ← Previous
              </Link>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const p = i + 1;
                return (
                  <Link
                    key={p}
                    href={`?page=${p}${currentStatus !== "all" ? `&status=${currentStatus}` : ""}`}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                      p === pagination.currentPage ? "bg-[var(--teal)] text-white" : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
              <Link
                href={pagination.currentPage >= pagination.totalPages ? "#" : `?page=${pagination.currentPage + 1}${currentStatus !== "all" ? `&status=${currentStatus}` : ""}`}
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
