import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/library";

const createOrderSchema = z.object({
  customer: z.object({
    email: z.string().email(),
    name: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
  items: z.array(
    z.object({ productId: z.string().min(1), quantity: z.number().int().min(1) })
  ),
  couponCode: z.string().optional(),
  shippingZoneId: z.string().optional(),
  shippingAddress: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Public API for storefront – create order.
 * Validates products (published, stock), applies coupon, calculates totals, creates order & items, decrements stock.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createOrderSchema.parse(body);
    if (data.items.length === 0)
      return NextResponse.json({ error: "At least one item required" }, { status: 400 });

    const productIds = [...new Set(data.items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, published: true },
    });
    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((p) => p.id));
      const missing = productIds.filter((id) => !foundIds.has(id));
      return NextResponse.json(
        { error: "Invalid or unpublished product", productIds: missing },
        { status: 400 }
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    let subtotal = 0;
    const orderItems: { productId: string; quantity: number; price: number }[] = [];

    for (const item of data.items) {
      const product = productMap.get(item.productId)!;
      if (product.stock < item.quantity)
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}`, productId: product.id },
          { status: 400 }
        );
      const price = Number(product.price);
      subtotal += price * item.quantity;
      orderItems.push({ productId: product.id, quantity: item.quantity, price });
    }

    let discount = 0;
    let couponCode: string | null = null;
    if (data.couponCode?.trim()) {
      const coupon = await prisma.coupon.findFirst({
        where: { code: data.couponCode.toUpperCase().trim(), active: true },
      });
      if (coupon) {
        const now = new Date();
        if (coupon.startsAt && now < coupon.startsAt)
          return NextResponse.json({ error: "Coupon not yet valid" }, { status: 400 });
        if (coupon.endsAt && now > coupon.endsAt)
          return NextResponse.json({ error: "Coupon expired" }, { status: 400 });
        if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses)
          return NextResponse.json({ error: "Coupon limit reached" }, { status: 400 });
        const min = Number(coupon.minOrder ?? 0);
        if (subtotal < min)
          return NextResponse.json(
            { error: `Minimum order ${min} required` },
            { status: 400 }
          );
        const val = Number(coupon.value);
        discount =
          coupon.type === "percent" ? (subtotal * val) / 100 : Math.min(val, subtotal);
        discount = Math.round(discount * 100) / 100;
        couponCode = coupon.code;
      }
    }

    let shippingCost = 0;
    let shippingZoneName: string | null = null;
    if (data.shippingZoneId) {
      const zone = await prisma.shippingZone.findUnique({
        where: { id: data.shippingZoneId },
      });
      if (zone) {
        shippingCost = Number(zone.price);
        shippingZoneName = zone.name;
      }
    }

    const tax = 0;
    const total = Math.max(0, subtotal - discount + shippingCost + tax);
    const orderNumber =
      "ORD-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();

    let customerId: string | null = null;
    let customer = await prisma.customer.findFirst({
      where: { email: data.customer.email.trim().toLowerCase() },
    });
    if (customer) {
      customerId = customer.id;
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: data.customer.name ?? customer.name,
          phone: data.customer.phone ?? customer.phone,
          address: data.customer.address ?? customer.address,
        },
      });
    } else {
      customer = await prisma.customer.create({
        data: {
          email: data.customer.email.trim().toLowerCase(),
          name: data.customer.name ?? null,
          phone: data.customer.phone ?? null,
          address: data.customer.address ?? null,
        },
      });
      customerId = customer.id;
    }

    const order = await prisma.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          status: "pending",
          subtotal: new Decimal(subtotal),
          shipping: new Decimal(shippingCost),
          tax: new Decimal(tax),
          total: new Decimal(total),
          couponCode,
          shippingZone: shippingZoneName,
          shippingAddr: data.shippingAddress ?? null,
          notes: data.notes ?? null,
        },
      });
      for (const it of orderItems) {
        await tx.orderItem.create({
          data: {
            orderId: o.id,
            productId: it.productId,
            quantity: it.quantity,
            price: new Decimal(it.price),
          },
        });
        await tx.product.update({
          where: { id: it.productId },
          data: { stock: { decrement: it.quantity } },
        });
      }
      if (couponCode) {
        await tx.coupon.updateMany({
          where: { code: couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }
      return o;
    });

    const full = await prisma.order.findUnique({
      where: { id: order.id },
      include: { customer: true, items: { include: { product: true } } },
    });
    return NextResponse.json(full);
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: "Validation failed", details: e.flatten() }, { status: 400 });
    throw e;
  }
}
