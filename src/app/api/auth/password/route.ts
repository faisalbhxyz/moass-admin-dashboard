import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const bodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const body = await request.json();
  const { currentPassword, newPassword } = bodySchema.parse(body);
  const full = await prisma.user.findUnique({ where: { id: user.id } });
  if (!full) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const bcrypt = await import("bcryptjs");
  const ok = await bcrypt.compare(currentPassword, full.password);
  if (!ok) return NextResponse.json({ error: "Current password is wrong" }, { status: 400 });
  const hashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });
  return NextResponse.json({ ok: true });
}
