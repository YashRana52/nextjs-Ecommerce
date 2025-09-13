import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    const handlePaymentIntent = async (paymentIntentId, isPaid) => {
      // Find related checkout session
      const session = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      if (!session.data.length) {
        throw new Error("No checkout session found for this paymentIntent");
      }

      const { orderIds, userId, appId } = session.data[0].metadata;

      if (appId !== "E-commerce") {
        return NextResponse.json({
          received: true,
          message: "Invalid app id",
        });
      }

      const orderIdsArray = orderIds.split(",");

      if (isPaid) {
        //  Mark orders as paid
        await Promise.all(
          orderIdsArray.map(async (orderId) => {
            await prisma.order.update({
              where: { id: orderId },
              data: { isPaid: true },
            });
          })
        );

        //  Clear user's cart
        await prisma.user.update({
          where: { id: userId },
          data: { cart: {} },
        });
      } else {
        //  Payment canceled → delete orders
        await Promise.all(
          orderIdsArray.map(async (orderId) => {
            await prisma.order.delete({
              where: { id: orderId },
            });
          })
        );
      }
    };

    switch (event.type) {
      case "payment_intent.succeeded": {
        await handlePaymentIntent(event.data.object.id, true);
        break;
      }
      case "payment_intent.canceled": {
        await handlePaymentIntent(event.data.object.id, false);
        break;
      }
      default:
        console.log("Unhandled Event type:", event.type);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook handler failed" },
      { status: 400 }
    );
  }
}
