import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { TopBar } from "@/components/layout/TopBar";
import { PageForm } from "../../PageForm";

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, page] = await Promise.all([
    getCurrentUser(),
    prisma.contentPage.findUnique({ where: { id } }),
  ]);
  if (!user) redirect("/auth/v2/login");
  if (!page) notFound();
  return (
    <div className="min-h-full">
      <TopBar
        breadcrumbs={[
          { label: "Pages", href: "/pages" },
          { label: page.title },
        ]}
        title={`Edit: ${page.title}`}
        description="Content is stored as HTML and shown as-is on the storefront."
      />
      <div className="p-6">
        <PageForm initial={page} />
      </div>
    </div>
  );
}
