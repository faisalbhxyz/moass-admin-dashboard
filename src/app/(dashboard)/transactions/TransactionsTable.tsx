"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { format } from "date-fns";
import { Receipt, Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";

type Transaction = {
  id: string;
  orderNumber: string;
  status: string;
  transactionId: string | null;
  senderNumber: string | null;
  total: { toString(): string };
  createdAt: Date;
  customer: { name: string | null; email: string } | null;
  paymentMethod: { name: string; type: string } | null;
  items: { product: { name: string } }[];
};

function buildQuery(params: { status?: string; page?: number }) {
  const q = new URLSearchParams();
  if (params.status && params.status !== "all") q.set("status", params.status);
  if (params.page && params.page > 1) q.set("page", String(params.page));
  const s = q.toString();
  return s ? "?" + s : "";
}

export function TransactionsTable({
  transactions,
  currentStatus = "all",
  summary,
  pagination,
}: {
  transactions: Transaction[];
  currentStatus?: string;
  summary?: { pendingCount: number; verifiedCount: number; totalCount: number };
  pagination?: { currentPage: number; totalPages: number; totalCount: number };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const handleVerify = useCallback(
    async (orderId: string) => {
      setVerifyingId(orderId);
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "paid" }),
        });
        if (res.ok) {
          toast.success("Transaction verified. Order marked as paid.");
          router.refresh();
        } else {
          toast.error("Failed to verify transaction");
        }
      } finally {
        setVerifyingId(null);
      }
    },
    [router]
  );

  const statusFilters = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "verified", label: "Verified" },
  ];

  const setStatus = (status: string) => {
    router.push(pathname + buildQuery({ status, page: 1 }));
  };

  return (
    <div className="space-y-6">
      {summary && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-2 h-0.5 w-8 rounded-full bg-amber-500" />
            <p className="text-2xl font-bold tracking-tight text-gray-900">{summary.pendingCount}</p>
            <p className="mt-1 text-xs text-gray-500">Pending verification</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-2 h-0.5 w-8 rounded-full bg-green-500" />
            <p className="text-2xl font-bold tracking-tight text-gray-900">{summary.verifiedCount}</p>
            <p className="mt-1 text-xs text-gray-500">Verified</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-2 h-0.5 w-8 rounded-full bg-gray-400" />
            <p className="text-2xl font-bold tracking-tight text-gray-900">{summary.totalCount}</p>
            <p className="mt-1 text-xs text-gray-500">Total (with payment)</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={currentStatus}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
        >
          {statusFilters.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="h-12 px-4 text-left">Order</th>
                <th className="h-12 px-4 text-left">Customer</th>
                <th className="h-12 px-4 text-left">Payment method</th>
                <th className="h-12 px-4 text-left">Transaction ID</th>
                <th className="h-12 px-4 text-left">Sender number</th>
                <th className="h-12 px-4 text-left">Amount</th>
                <th className="h-12 px-4 text-left">Status</th>
                <th className="h-12 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => {
                const isPending = t.status === "pending";
                return (
                  <tr
                    key={t.id}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                          <Receipt className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <Link
                            href={`/orders/${t.id}`}
                            className="font-mono font-medium text-[var(--teal)] hover:underline"
                          >
                            #{t.orderNumber}
                          </Link>
                          <p className="text-xs text-gray-500">{format(t.createdAt, "MMM d, yyyy HH:mm")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900">{t.customer?.name ?? t.customer?.email ?? "Guest"}</p>
                      {t.customer?.email && t.customer?.name && (
                        <p className="text-xs text-gray-500">{t.customer.email}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{t.paymentMethod?.name ?? "—"}</p>
                      <p className="text-xs text-gray-500">{t.paymentMethod?.type ?? ""}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-gray-900">{t.transactionId ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900">{t.senderNumber ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">৳{Number(t.total).toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      {isPending ? (
                        <Badge variant="pending">Pending</Badge>
                      ) : (
                        <Badge variant="accepted">Verified</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/orders/${t.id}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                          aria-label="View order"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => handleVerify(t.id)}
                            disabled={verifyingId === t.id}
                            className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-70"
                          >
                            {verifyingId === t.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3.5 w-3.5" />
                            )}
                            Verify
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {transactions.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">
            No transactions found. Orders with a selected payment method will appear here.
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 px-6 py-4">
            <p className="text-sm text-gray-500">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={
                  pagination.currentPage <= 1
                    ? "#"
                    : pathname + buildQuery({ status: currentStatus, page: pagination.currentPage - 1 })
                }
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                  pagination.currentPage <= 1
                    ? "cursor-not-allowed border-gray-200 text-gray-400"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                ← Previous
              </Link>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const p = i + 1;
                return (
                  <Link
                    key={p}
                    href={pathname + buildQuery({ status: currentStatus, page: p })}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                      p === pagination.currentPage
                        ? "bg-[var(--teal)] text-white"
                        : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
              <Link
                href={
                  pagination.currentPage >= pagination.totalPages
                    ? "#"
                    : pathname + buildQuery({ status: currentStatus, page: pagination.currentPage + 1 })
                }
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                  pagination.currentPage >= pagination.totalPages
                    ? "cursor-not-allowed border-gray-200 text-gray-400"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
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
