import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  regions: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  sortOrder: z.number().int().optional(),
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
  const zone = await prisma.shippingZone.update({ where: { id }, data });
  return NextResponse.json(zone);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id } = await params;
  await prisma.shippingZone.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
