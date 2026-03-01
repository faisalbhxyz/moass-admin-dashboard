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
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  compareAt: z.number().positive().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  images: z.string().optional().nullable(),
  variationImages: z.string().optional().nullable(),
  stock: z.number().int().min(0).optional(),
  sku: z.string().optional().nullable(),
  published: z.boolean().optional(),
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
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      compareAt: data.compareAt ?? undefined,
      categoryId: data.categoryId ?? undefined,
      images: data.images ?? undefined,
      variationImages: data.variationImages ?? undefined,
      sku: data.sku ?? undefined,
    },
    include: { category: true },
  });
  return NextResponse.json(product);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
