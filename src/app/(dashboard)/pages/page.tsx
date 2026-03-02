import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { TopBar } from "@/components/layout/TopBar";
import { PagesClient } from "./PagesClient";
import Link from "next/link";

export default async function PagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/v2/login");
  const pages = await prisma.contentPage.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    select: { id: true, slug: true, title: true, sortOrder: true, active: true, updatedAt: true },
  });
  return (
    <div className="min-h-full">
      <TopBar
        breadcrumbs={[{ label: "Pages" }]}
        title="Policy, Terms & Other Pages"
        description="Manage Policy, Terms & Conditions, Return Policy, etc. Content is stored as HTML and shown as-is on the storefront."
        actions={
          <Link href="/pages/new">
            <button
              type="button"
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
            >
              Add page
            </button>
          </Link>
        }
      />
      <div className="p-6">
        <PagesClient initialPages={pages} />
      </div>
    </div>
  );
}
