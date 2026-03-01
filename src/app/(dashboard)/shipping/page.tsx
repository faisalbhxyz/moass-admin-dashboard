import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { TopBar } from "@/components/layout/TopBar";
import { ShippingClient } from "./ShippingClient";

export default async function ShippingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/v2/login");
  const zones = await prisma.shippingZone.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return (
    <div className="min-h-full">
      <TopBar breadcrumbs={[{ label: "Shipping" }]} />
      <div className="p-6">
        <ShippingClient initialZones={zones} />
      </div>
    </div>
  );
}
