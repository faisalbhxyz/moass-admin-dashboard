import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";

export default async function CustomersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/v2/login");
  const customers = await prisma.customer.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="min-h-full">
      <TopBar breadcrumbs={[{ label: "Customers" }]} />
      <div className="p-6">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="h-12 px-4 text-left">Email</th>
                  <th className="h-12 px-4 text-left">Name</th>
                  <th className="h-12 px-4 text-left">Phone</th>
                  <th className="h-12 w-10 px-2 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="group border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50">
                    <td className="h-12 px-4 text-gray-900">{c.email}</td>
                    <td className="h-12 px-4 text-gray-700">{c.name ?? "—"}</td>
                    <td className="h-12 px-4 text-gray-700">{c.phone ?? "—"}</td>
                    <td className="h-12 px-2 text-right">
                      <Link
                        href={`/customers/${c.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 opacity-0 transition-opacity duration-150 group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-900"
                        aria-label="View"
                      >
                        …
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {customers.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-500">No customers yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
