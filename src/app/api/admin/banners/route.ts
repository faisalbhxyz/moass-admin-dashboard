import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";
import { z } from "zod";

export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const banners = await prisma.banner.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(banners);
}

const createSchema = z.object({
  title: z.string().optional(),
  image: z.string().min(1),
  link: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const body = await request.json();
  const data = createSchema.parse(body);
  const banner = await prisma.banner.create({
    data: { ...data, link: data.link ?? null },
  });
  return NextResponse.json(banner);
}
