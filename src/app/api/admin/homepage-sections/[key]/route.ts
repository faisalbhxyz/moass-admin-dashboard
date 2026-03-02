import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";
import { parseSectionConfig } from "@/lib/homepage-sections";
import { resolveSectionProducts } from "@/lib/resolve-homepage-section";
import { z } from "zod";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { key } = await params;
  const section = await prisma.homepageSection.findUnique({
    where: { key },
  });
  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  const config = parseSectionConfig(section.config);
  const products = await resolveSectionProducts(prisma, section);

  return NextResponse.json({
    section: {
      id: section.id,
      key: section.key,
      title: section.title,
      ...config,
    },
    products,
    pinned_count: products.filter((p) => p.source === "pinned").length,
    auto_count: products.filter((p) => p.source === "auto").length,
  });
}

const patchSchema = z.object({
  title: z.string().max(120).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { key } = await params;
  const section = await prisma.homepageSection.findUnique({ where: { key } });
  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  const body = await request.json();
  const data = patchSchema.parse(body);
  if (data.title !== undefined) {
    await prisma.homepageSection.update({
      where: { key },
      data: { title: data.title.trim() || null },
    });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { key } = await params;
  const section = await prisma.homepageSection.findUnique({ where: { key } });
  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  await prisma.homepageSection.delete({ where: { key } });
  return NextResponse.json({ ok: true });
}
