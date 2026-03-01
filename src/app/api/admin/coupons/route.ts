import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";
import { z } from "zod";

export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(coupons);
}

const createSchema = z.object({
  code: z.string().min(1),
  type: z.enum(["percent", "fixed"]),
  value: z.number().min(0),
  minOrder: z.number().min(0).optional().nullable(),
  maxUses: z.number().int().min(0).optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  active: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const body = await request.json();
  const data = createSchema.parse(body);
  const coupon = await prisma.coupon.create({
    data: {
      code: data.code.toUpperCase().replace(/\s/g, ""),
      type: data.type,
      value: data.value,
      minOrder: data.minOrder ?? null,
      maxUses: data.maxUses ?? null,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      active: data.active,
    },
  });
  return NextResponse.json(coupon);
}
