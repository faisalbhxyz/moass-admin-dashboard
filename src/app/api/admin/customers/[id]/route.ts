import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";
import { z } from "zod";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { orders: { orderBy: { createdAt: "desc" }, take: 20 } },
  });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(customer);
}

const updateSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
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
  const customer = await prisma.customer.update({ where: { id }, data });
  return NextResponse.json(customer);
}
