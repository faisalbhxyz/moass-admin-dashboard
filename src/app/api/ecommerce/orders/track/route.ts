import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/ecommerce/orders/track?orderNumber=XXX
 * Public endpoint – no auth. Look up order by orderNumber and return ApiOrder shape.
 * Used by storefront "Order Tracking" page (guest or logged-in).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("orderNumber")?.trim();

  if (!orderNumber) {
    return NextResponse.json(
      { error: "orderNumber is required" },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}
