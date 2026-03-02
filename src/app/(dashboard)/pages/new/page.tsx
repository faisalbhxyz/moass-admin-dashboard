import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { PageForm } from "../PageForm";

export default async function NewPagePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/v2/login");
  return (
    <div className="min-h-full">
      <TopBar
        breadcrumbs={[{ label: "Pages", href: "/pages" }, { label: "New page" }]}
        title="New page"
        description="Add a content page (Policy, Terms, Return Policy, etc.). Use HTML for formatting; same design will show on the storefront."
      />
      <div className="p-6">
        <PageForm />
      </div>
    </div>
  );
}
