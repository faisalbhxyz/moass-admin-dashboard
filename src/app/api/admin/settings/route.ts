import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";
import { z } from "zod";

export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const rows = await prisma.setting.findMany();
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  return NextResponse.json(settings);
}

const updateSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]));

export async function PATCH(request: NextRequest) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const body = await request.json();
  const data = updateSchema.parse(body);
  for (const [key, value] of Object.entries(data)) {
    await prisma.setting.upsert({
      where: { key },
      create: { key, value: String(value) },
      update: { value: String(value) },
    });
  }
  const rows = await prisma.setting.findMany();
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  return NextResponse.json(settings);
}
