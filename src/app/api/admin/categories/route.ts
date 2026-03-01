import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";
import { z } from "zod";

export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { parent: true, children: true, _count: { select: { products: true } } },
  });
  return NextResponse.json(categories);
}

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  try {
    const body = await request.json();
    const data = createSchema.parse(body);
    const category = await prisma.category.create({
      data: { ...data, parentId: data.parentId ?? null, image: data.image ?? null },
      include: { parent: true },
    });
    return NextResponse.json(category);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return NextResponse.json(
        { error: "A category with this slug already exists." },
        { status: 400 }
      );
    }
    if (e && typeof e === "object" && "message" in e && typeof (e as { message: string }).message === "string") {
      return NextResponse.json(
        { error: (e as { message: string }).message },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to create category." }, { status: 500 });
  }
}
