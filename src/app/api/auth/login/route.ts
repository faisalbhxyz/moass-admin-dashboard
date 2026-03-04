import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { z } from "zod";
import { withRateLimit, LIMITS } from "@/lib/rate-limit";

const bodySchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(request: NextRequest) {
  const rl = withRateLimit(request, LIMITS.ADMIN_LOGIN);
  if (!rl.ok) return rl.response;
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
    const err = e instanceof Error ? e : new Error(String(e));
    const msg = err.message || "";
    const isPrismaInit =
      err.constructor?.name === "PrismaClientInitializationError" ||
      msg.includes("Invalid `prisma`") ||
      msg.includes("PrismaClientInitializationError");
    const isDbError =
      isPrismaInit ||
      msg.includes("Can't reach database") ||
      msg.includes("connect") ||
      msg.includes("Unknown table") ||
      msg.includes("denied access");
    const isAuthSecret = msg.includes("AUTH_SECRET");
    let message = "Login failed";
    if (process.env.NODE_ENV === "development")
      message = msg;
    else if (isPrismaInit)
      message = "Database not configured. Set DATABASE_URL in Vercel (and run migrations).";
    else if (isDbError)
      message = "Database not reachable. Check DATABASE_URL and that tables exist.";
    else if (isAuthSecret)
      message = "Server config error. Set AUTH_SECRET in Vercel environment variables.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
