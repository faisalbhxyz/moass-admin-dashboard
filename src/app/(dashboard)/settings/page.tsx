import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { TopBar } from "@/components/layout/TopBar";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/v2/login");
  const rows = await prisma.setting.findMany();
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  return (
    <div className="min-h-full">
      <TopBar breadcrumbs={[{ label: "Settings" }]} />
      <div className="p-6">
        <div className="flex gap-6">
          <nav className="w-[120px] shrink-0">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Settings</p>
            <ul className="mt-2 space-y-0.5">
              <li>
                <span className="block rounded-md px-3 py-2 text-sm font-medium text-gray-900 bg-white shadow-sm">
                  General
                </span>
              </li>
            </ul>
          </nav>
          <div className="min-w-0 flex-1">
            <SettingsForm initial={settings} />
          </div>
        </div>
      </div>
    </div>
  );
}
