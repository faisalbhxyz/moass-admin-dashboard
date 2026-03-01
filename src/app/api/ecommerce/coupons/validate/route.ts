import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const bodySchema = z.object({ code: z.string().min(1), subtotal: z.number().min(0) });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, subtotal } = bodySchema.parse(body);
    const coupon = await prisma.coupon.findFirst({
      where: { code: code.toUpperCase().trim(), active: true },
    });
    if (!coupon) return NextResponse.json({ error: "Invalid or expired coupon" }, { status: 400 });
    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt)
      return NextResponse.json({ error: "Coupon not yet valid" }, { status: 400 });
    if (coupon.endsAt && now > coupon.endsAt)
      return NextResponse.json({ error: "Coupon expired" }, { status: 400 });
    if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses)
      return NextResponse.json({ error: "Coupon limit reached" }, { status: 400 });
    const min = Number(coupon.minOrder ?? 0);
    if (subtotal < min)
      return NextResponse.json({ error: `Minimum order ${min} required` }, { status: 400 });
    const val = Number(coupon.value);
    const discount =
      coupon.type === "percent" ? (subtotal * val) / 100 : Math.min(val, subtotal);
    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount: Math.round(discount * 100) / 100,
      type: coupon.type,
      value: val,
    });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}
