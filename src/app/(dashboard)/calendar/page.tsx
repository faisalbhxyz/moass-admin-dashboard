import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { TopBar } from "@/components/layout/TopBar";
import { CalendarClient } from "./CalendarClient";

export default async function CalendarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/v2/login");
  const orders = await prisma.order.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    select: { id: true, orderNumber: true, status: true, total: true, createdAt: true },
  });
  const events = orders.map((o) => ({
    id: o.id,
    title: `${o.orderNumber} — ৳${Number(o.total).toLocaleString()}`,
    date: format(o.createdAt, "yyyy-MM-dd"),
    status: o.status,
  }));
  return (
    <div className="min-h-full">
      <TopBar breadcrumbs={[{ label: "Calendar" }]} />
      <div className="p-6">
        <p className="mb-4 text-sm text-gray-500">Order dates (view).</p>
        <CalendarClient events={events} />
      </div>
    </div>
  );
}
