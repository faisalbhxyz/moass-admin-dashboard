import Link from "next/link";
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
  customer: { name: string | null; email: string | null } | null;
  items: { product: { name: string } }[];
};

export function RecentOrdersTable({ orders }: { orders: Order[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-sm font-semibold text-gray-900">Recent Orders</h3>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex flex-1 min-w-[200px] items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <span className="text-sm text-gray-500">Search by name, Order ID...</span>
          </div>
          <select className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
            <option>All Status</option>
          </select>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
            01 Jan, 2024 to 31 Dec, 2024
          </div>
        </div>
      </div>
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
        {orders.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">No orders yet.</div>
        )}
      </div>
      <div className="border-t border-gray-200 px-6 py-3">
        <Link href="/orders" className="text-sm font-medium text-[var(--teal)] hover:underline">
          View all orders →
        </Link>
      </div>
    </div>
  );
}
