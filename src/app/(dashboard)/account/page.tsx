import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { AccountForm } from "./AccountForm";
import { PasswordForm } from "./PasswordForm";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/v2/login");
  return (
    <div className="min-h-full">
      <TopBar breadcrumbs={[{ label: "Account" }]} />
      <div className="p-6">
        <div className="mx-auto max-w-xl space-y-6">
          <AccountForm user={user} />
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}
