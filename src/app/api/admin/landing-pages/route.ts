import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";
import { z } from "zod";

export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const rows = await prisma.productLandingPage.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { select: { id: true, name: true, slug: true } } },
  });
  return NextResponse.json(rows);
}

const createSchema = z.object({
  productId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const body = await request.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors || "Invalid body." },
      { status: 400 }
    );
  }
  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
  });
  if (!product) {
    return NextResponse.json(
      { error: "Product not found." },
      { status: 404 }
    );
  }
  const landing = await prisma.productLandingPage.create({
    data: { productId: parsed.data.productId },
    include: { product: { select: { id: true, name: true, slug: true } } },
  });
  return NextResponse.json(landing);
}
