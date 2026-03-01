import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const skip = (page - 1) * limit;
  const [customers, total] = await Promise.all([
    prisma.customer.findMany({ skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.customer.count(),
  ]);
  return NextResponse.json({ customers, total, page, limit });
}
