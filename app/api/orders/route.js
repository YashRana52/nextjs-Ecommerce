import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PaymentMethod } from "@prisma/client"; // ✅ import enum
import Stripe from "stripe";
export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const { addressId, items, couponCode, paymentMethod } =
      await request.json();

    if (
      !addressId ||
      !items ||
      !paymentMethod ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "missing order details." },
        { status: 400 }
      );
    }

    let coupon = null;
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (!coupon) {
        return NextResponse.json(
          { error: "Coupon not found" },
          { status: 404 }
        );
      }
    }

    const ordersByStore = new Map();
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
      });
      if (!product) {
        return NextResponse.json(
          { error: `Product with id ${item.id} not found` },
          { status: 404 }
        );
      }
      const storeId = product.storeId;
      if (!ordersByStore.has(storeId)) ordersByStore.set(storeId, []);
      ordersByStore.get(storeId).push(item);
    }

    let fullAmount = 0;
    let orderIds = [];

    for (const [storeId, sellerItems] of ordersByStore.entries()) {
      let total = sellerItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      if (couponCode) {
        total -= (total * coupon.discount) / 100;
      }

      fullAmount += parseFloat(total.toFixed(2));

      const order = await prisma.order.create({
        data: {
          userId,
          storeId,
          addressId,
          total: parseFloat(total.toFixed(2)),
          paymentMethod,
          isCouponUsed: !!coupon,
          coupon: coupon
            ? {
                code: coupon.code,
                discount: coupon.discount,
              }
            : {},
          orderItems: {
            create: sellerItems.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      orderIds.push(order.id);
    }

    if (paymentMethod === "STRIPE") {
      const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
      const origin = await request.headers.get("origin");

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: "order",
              },
              unit_amount: Math.round(fullAmount * 100),
            },
            quantity: 1,
          },
        ],
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        mode: "payment",
        success_url: `${origin}/loading?nextUrl= orders`,
        cancel_url: `${origin}/cart`,
        metadata: {
          orderIds: orderIds.join(","),
          userId,
          appId: "E-commerce",
        },
      });
      return NextResponse.json({
        session,
      });
    }

    //  clear user cart after placing order
    await prisma.user.update({
      where: { id: userId },
      data: { cart: {} },
    });

    return NextResponse.json({
      message: "order placed successfully",
      orderIds,
      totalAmount: fullAmount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

//sare order milenge yha pe

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId,
        OR: [
          { paymentMethod: PaymentMethod.COD },
          {
            AND: [{ paymentMethod: PaymentMethod.STRIPE }, { isPaid: true }],
          },
        ],
      },
      include: {
        orderItems: { include: { product: true } },
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
