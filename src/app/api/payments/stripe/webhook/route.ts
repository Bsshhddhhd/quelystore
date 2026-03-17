import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { dataStore } from '@/lib/data';
import { sendDiscordNotification, createPurchaseConfirmation } from '@/utils/discord';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig || !endpointSecret) {
      return NextResponse.json(
        { error: 'Missing signature or secret' },
        { status: 400 }
      );
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      return NextResponse.json(
        { error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
        { status: 400 }
      );
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      // Get orderId from metadata
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        // Find order by orderId
        const order = await dataStore.getOrderByOrderId(orderId);

        if (order) {
          await dataStore.updateOrder(order._id, {
            paymentStatus: 'completed',
          });

          // Send confirmation to Discord
          const confirmationMessage = createPurchaseConfirmation({
            customerName: order.customerName,
            productName: order.productName,
            orderId: order._id,
            price: order.amount,
          });

          if (process.env.DISCORD_WEBHOOK_URL) {
            await sendDiscordNotification(
              process.env.DISCORD_WEBHOOK_URL,
              confirmationMessage
            );
          }
        }
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        const orders = await dataStore.getOrders();
        const order = orders.find(o => o._id === orderId);

        if (order) {
          await dataStore.updateOrder(order._id, {
            paymentStatus: 'failed',
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
