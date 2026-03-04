import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { LoginForm } from "@/components/LoginForm";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";

function isNextRedirect(err: unknown): boolean {
  return !!(
    err &&
    typeof err === "object" &&
    "digest" in err &&
    String((err as { digest?: string }).digest).startsWith("NEXT_")
  );
}

const getLowStockCount = unstable_cache(
  async () => {
    try {
      const setting = await prisma.setting
        .findUnique({ where: { key: "low_stock_threshold" } })
        .catch(() => null);
      const threshold = parseInt(setting?.value ?? "5", 10);
      return await prisma.product
        .count({ where: { stock: { lte: threshold }, published: true } })
        .catch(() => 0);
    } catch {
      return 0;
    }
  },
  ["dashboard-low-stock-count"],
  { revalidate: 30 }
);

const getNewOrdersCount = unstable_cache(
  async () => {
    try {
      return await prisma.order
        .count({ where: { status: "pending" } })
        .catch(() => 0);
    } catch {
      return 0;
    }
  },
  ["dashboard-new-orders-count"],
  { revalidate: 30 }
);

const getPendingTransactionsCount = unstable_cache(
  async () => {
    try {
      return await prisma.order
        .count({
          where: {
            paymentMethodId: { not: null },
            paymentMethod: { type: { not: "COD" } },
            status: "pending",
          },
        })
        .catch(() => 0);
    } catch {
      return 0;
    }
  },
  ["dashboard-pending-transactions-count"],
  { revalidate: 30 }
);

export default async function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  try {
    const [user, lowStockCount, newOrdersCount, pendingTransactionsCount] = await Promise.all([
      getCurrentUser(),
      getLowStockCount(),
      getNewOrdersCount(),
      getPendingTransactionsCount(),
    ]);
    // #region agent log
    fetch("http://127.0.0.1:7547/ingest/99499ef2-17dc-45b2-bd71-46407300a8b4",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"91330f"},body:JSON.stringify({sessionId:"91330f",location:"dashboard/layout:getCurrentUser",message:"user check",data:{hasUser:!!user},timestamp:Date.now(),hypothesisId:"B"})}).catch(()=>{});
    // #endregion
    if (!user) return <LoginForm />;
    return (
      <QueryProvider>
        <div className="flex h-screen overflow-hidden bg-[#F9F9F9]">
          <Sidebar
            userName={user?.name ?? user?.email}
            lowStockCount={lowStockCount}
            newOrdersCount={newOrdersCount}
            pendingTransactionsCount={pendingTransactionsCount}
          />
          <main className="ml-60 flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </QueryProvider>
    );
  } catch (err) {
    if (isNextRedirect(err)) throw err;
    console.error("Dashboard layout error:", err);
    redirect("/?error=session");
  }
}
