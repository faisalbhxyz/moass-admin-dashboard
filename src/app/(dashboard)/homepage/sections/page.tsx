import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { TopBar } from "@/components/layout/TopBar";
import { HomepageSectionsClient } from "./HomepageSectionsClient";

export default async function HomepageSectionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/v2/login");
  const sections = await prisma.homepageSection.findMany({
    orderBy: [{ pinned: "desc" }, { sortOrder: "asc" }],
  });
  return (
    <div className="min-h-full">
      <TopBar breadcrumbs={[{ label: "Homepage Sections" }]} />
      <div className="p-6">
        <p className="mb-4 text-sm text-gray-500">Configure section type: auto / manual / hybrid. Pin and reorder.</p>
        <HomepageSectionsClient initialSections={sections} />
      </div>
    </div>
  );
}
