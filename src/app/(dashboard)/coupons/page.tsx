import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { TopBar } from "@/components/layout/TopBar";
import { CouponsClient } from "./CouponsClient";

export default async function CouponsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/v2/login");
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="min-h-full">
      <TopBar breadcrumbs={[{ label: "Coupons" }]} />
      <div className="p-6">
        <CouponsClient initialCoupons={coupons} />
      </div>
    </div>
  );
}
