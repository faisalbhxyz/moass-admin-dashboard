import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/customer-auth";

/** GET /api/search/history – last 8 unique searches for logged-in customer. Auth required. */
export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer)
    return NextResponse.json({ error: "লগইন করা নেই।" }, { status: 401 });

  try {
    const rows = await prisma.userSearchHistory.findMany({
      where: { userId: customer.id },
      orderBy: { searchedAt: "desc" },
      take: 8,
      select: { query: true, searchedAt: true },
    });
    return NextResponse.json({
      history: rows.map((r) => ({ query: r.query, searchedAt: r.searchedAt })),
    });
  } catch (e) {
    console.error("[search/history GET]", e);
    return NextResponse.json(
      { error: "Failed to load search history" },
      { status: 500 }
    );
  }
}

/** DELETE /api/search/history – clear all, or one item if ?query= is provided. */
export async function DELETE(request: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer)
    return NextResponse.json({ error: "লগইন করা নেই।" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const singleQuery = searchParams.get("query")?.trim();

  try {
    await prisma.userSearchHistory.deleteMany({
      where: {
        userId: customer.id,
        ...(singleQuery ? { query: singleQuery } : {}),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[search/history DELETE]", e);
    return NextResponse.json(
      { error: "Failed to clear search history" },
      { status: 500 }
    );
  }
}
