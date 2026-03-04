import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { format } from "date-fns";
import { TopBar } from "@/components/layout/TopBar";
import { CustomerEditForm } from "./CustomerEditForm";

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/v2/login");
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { orders: { orderBy: { createdAt: "desc" }, take: 20 } },
  });
  if (!customer) notFound();

  return (
    <div className="min-h-full">
      <TopBar
        breadcrumbs={[
          { label: "Customers", href: "/customers" },
          { label: customer.name ?? customer.email },
        ]}
      />
      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="text-sm font-medium text-gray-900">Customer</div>
                {customer.lastLoginAt != null && (
                  <p className="mt-1 text-xs text-gray-500">
                    Last login: {format(customer.lastLoginAt, "MMM d, yyyy · h:mm a")}
                  </p>
                )}
              </div>
              <div className="px-6 py-4">
                <CustomerEditForm customer={customer} />
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="text-sm font-medium text-gray-900">Recent orders</div>
              </div>
              <div className="px-6 py-4">
                <ul className="space-y-2 text-sm">
                  {customer.orders.map((o) => (
                    <li key={o.id} className="flex items-center justify-between">
                      <Link href={`/orders/${o.id}`} className="font-medium text-gray-900 hover:underline">
                        {o.orderNumber}
                      </Link>
                      <span className="text-gray-600">৳{Number(o.total).toLocaleString()} — {format(o.createdAt, "MMM d, yyyy")}</span>
                    </li>
                  ))}
                  {customer.orders.length === 0 && <li className="text-gray-500">No orders</li>}
                </ul>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {customer.address && (
              <div className="rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">Address</div>
                </div>
                <div className="px-6 py-4 text-sm text-gray-700">{customer.address}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
