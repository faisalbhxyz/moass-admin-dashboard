import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { z } from "zod";

const bodySchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = bodySchema.parse(body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.password)))
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    await createSession({ sub: user.id, email: user.email });
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    console.error("Login error:", e);
    const isDbError = e && typeof e === "object" && "message" in e && typeof (e as Error).message === "string" && ((e as Error).message.includes("Can't reach database") || (e as Error).message.includes("connect"));
    const message = isDbError
      ? "Database not reachable. Check DATABASE_URL in .env and that the database is running."
      : process.env.NODE_ENV === "development" && e instanceof Error ? e.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
