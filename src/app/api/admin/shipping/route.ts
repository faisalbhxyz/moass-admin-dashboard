import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";
import { z } from "zod";

export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const zones = await prisma.shippingZone.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(zones);
}

const createSchema = z.object({
  name: z.string().min(1),
  regions: z.string().min(1),
  price: z.number().min(0),
  sortOrder: z.number().int().default(0),
});

export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const body = await request.json();
  const data = createSchema.parse(body);
  const zone = await prisma.shippingZone.create({ data });
  return NextResponse.json(zone);
}
