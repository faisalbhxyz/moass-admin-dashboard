import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withRateLimit, LIMITS } from "@/lib/rate-limit";

/**
 * GET /api/ecommerce/orders/track?orderNumber=XXX&email=YYY
 *    OR ?orderNumber=XXX&phone=ZZZ
 * Public endpoint – requires orderNumber + (email OR phone) for verification (prevents IDOR).
 * Use email when available; use phone for orders placed without email.
 */
export async function GET(request: NextRequest) {
  const rl = withRateLimit(request, LIMITS.ORDER_TRACK);
  if (!rl.ok) return rl.response;

  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("orderNumber")?.trim();
  const email = searchParams.get("email")?.trim()?.toLowerCase();
  const phone = searchParams.get("phone")?.trim();

  if (!orderNumber) {
    return NextResponse.json(
      { error: "orderNumber প্রয়োজন" },
      { status: 400 }
    );
  }
  if (!email && !phone) {
    return NextResponse.json(
      { error: "orderNumber এর সাথে email অথবা phone দিন" },
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

  const cust = order.customer;
  let verified = false;
  if (email && cust?.email) {
    verified = cust.email.trim().toLowerCase() === email;
  }
  if (!verified && phone && cust?.phone) {
    verified = cust.phone.trim() === phone;
  }
  if (!verified) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}
