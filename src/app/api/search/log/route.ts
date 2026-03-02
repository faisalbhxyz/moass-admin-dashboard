import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { z } from "zod";

const bodySchema = z.object({ query: z.string().min(1).max(500) });

function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return request.headers.get("x-real-ip") ?? null;
}

/**
 * POST /api/search/log – log a search (every time user submits).
 * Always writes to search_logs. If logged in, upserts user_search_history.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = bodySchema.parse(body);

    const customer = await getCurrentCustomer();
    const ip = getClientIp(request);

    await prisma.$transaction(async (tx) => {
      await tx.searchLog.create({
        data: {
          query: query.trim(),
          userId: customer?.id ?? null,
          ipAddress: ip,
        },
      });

      if (customer) {
        await tx.userSearchHistory.upsert({
          where: {
            userId_query: { userId: customer.id, query: query.trim() },
          },
          create: {
            userId: customer.id,
            query: query.trim(),
          },
          update: { searchedAt: new Date() },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    console.error("[search/log]", e);
    return NextResponse.json(
      { error: "Failed to log search" },
      { status: 500 }
    );
  }
}
