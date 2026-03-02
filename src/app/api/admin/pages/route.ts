import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";
import { z } from "zod";

export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const pages = await prisma.contentPage.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  return NextResponse.json(pages);
}

const createSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug: only lowercase letters, numbers, hyphens"),
  title: z.string().min(1),
  content: z.string(),
  sortOrder: z.number().int().optional(),
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
  try {
    const page = await prisma.contentPage.create({
      data: {
        slug: parsed.data.slug,
        title: parsed.data.title,
        content: parsed.data.content,
        sortOrder: parsed.data.sortOrder ?? 0,
      },
    });
    return NextResponse.json(page);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Database error";
    if (String(msg).includes("Unique constraint")) {
      return NextResponse.json(
        { error: "A page with this slug already exists." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
