import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const PUBLIC_KEYS = ["site_name", "currency"];

/**
 * Public API for storefront – public settings (site name, currency).
 * No auth required.
 */
export async function GET() {
  const rows = await prisma.setting.findMany({
    where: { key: { in: PUBLIC_KEYS } },
  });
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  return NextResponse.json(settings);
}
