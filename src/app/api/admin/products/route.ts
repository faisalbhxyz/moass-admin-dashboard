import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const skip = (page - 1) * limit;
  const categoryId = searchParams.get("categoryId") || undefined;
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: limit,
      where: categoryId ? { categoryId } : undefined,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { category: true },
    }),
    prisma.product.count({ where: categoryId ? { categoryId } : undefined }),
  ]);
  return NextResponse.json({ products, total, page, limit });
}

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  compareAt: z.number().positive().optional(),
  categoryId: z.string().optional(),
  images: z.string().optional(),
  variationImages: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  sku: z.string().optional(),
  published: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const body = await request.json();
  const data = createSchema.parse(body);
  const product = await prisma.product.create({
    data: {
      ...data,
      price: data.price,
      compareAt: data.compareAt ?? null,
      images: data.images ?? null,
      variationImages: data.variationImages ?? null,
      categoryId: data.categoryId ?? null,
      sku: data.sku ?? null,
    },
    include: { category: true },
  });
  return NextResponse.json(product);
}
