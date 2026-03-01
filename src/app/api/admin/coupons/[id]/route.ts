import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";
import { z } from "zod";

const updateSchema = z.object({
  code: z.string().min(1).optional(),
  type: z.enum(["percent", "fixed"]).optional(),
  value: z.number().min(0).optional(),
  minOrder: z.number().min(0).optional().nullable(),
  maxUses: z.number().int().min(0).optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  active: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id } = await params;
  const body = await request.json();
  const data = updateSchema.parse(body);
  const coupon = await prisma.coupon.update({
    where: { id },
    data: {
      ...data,
      code: data.code ? data.code.toUpperCase().replace(/\s/g, "") : undefined,
      startsAt: data.startsAt !== undefined ? (data.startsAt ? new Date(data.startsAt) : null) : undefined,
      endsAt: data.endsAt !== undefined ? (data.endsAt ? new Date(data.endsAt) : null) : undefined,
    },
  });
  return NextResponse.json(coupon);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id } = await params;
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
