import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({ name: z.string().optional().nullable() });

export async function PATCH(request: NextRequest) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const body = await request.json().catch(() => ({}));
  const data = schema.parse(body);
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name: data.name ?? null },
    select: { id: true, email: true, name: true, role: true },
  });
  return NextResponse.json({ user: updated });
}
