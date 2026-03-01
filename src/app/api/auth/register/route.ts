import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = bodySchema.parse(body);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashed, name: name ?? null, role: "admin" },
    });
    await createSession({ sub: user.id, email: user.email });
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
