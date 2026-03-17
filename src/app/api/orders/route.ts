import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/data';
import {
  convertKwdToUsd,
  createStripePaymentIntent,
  initializePayPalPayment,
  generateOrderId,
} from '@/utils/payment';
import { sendDiscordNotification, createOrderNotification } from '@/utils/discord';

export async function GET(request: NextRequest) {
  try {
    const orders = await dataStore.getOrders();

    const paymentPriority: Record<string, number> = {
      awaiting_confirmation: 0,
      pending: 1,
      failed: 2,
      completed: 3,
    };

    // Show actionable orders first, then fallback to newest first.
    orders.sort((a, b) => {
      const aPriority = paymentPriority[a.paymentStatus] ?? 99;
      const bPriority = paymentPriority[b.paymentStatus] ?? 99;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderId = generateOrderId();

    // Validate input
    if (!body.customerName || !body.customerEmail || !body.productId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create order in local storage
    const order = await dataStore.createOrder({
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone || '',
      productId: body.productId,
      productName: body.productName,
      amount: body.price,
      paymentMethod: body.paymentMethod,
      paymentStatus: 'pending',
      discordWebhookSent: false,
    });

    // Send Discord notification about new order
    const notificationMessage = createOrderNotification({
      orderId,
      productName: body.productName,
      customerName: body.customerName,
      discordUsername: body.discordUsername || '',
      price: body.price,
      paymentMethod: body.paymentMethod,
    });

    if (process.env.DISCORD_WEBHOOK_URL) {
      await sendDiscordNotification(process.env.DISCORD_WEBHOOK_URL, notificationMessage);
    }

    // Initialize payment based on method
    let paymentResponse;
    const priceKwd = Number(body.price || 0);
    const priceUsd = convertKwdToUsd(priceKwd);

    if (body.paymentMethod === 'stripe') {
      paymentResponse = await createStripePaymentIntent(
        priceUsd,
        'usd',
        order._id,
        body.productName
      );

      if (paymentResponse.success) {
        return NextResponse.json({
          orderId,
          stripeUrl: paymentResponse.checkoutUrl,
        });
      }
    } else if (body.paymentMethod === 'bank_transfer') {
      return NextResponse.json({
        orderId: order._id,
        bankTransferUrl: `/bank-transfer/${order._id}`,
      });
    } else if (body.paymentMethod === 'paypal') {
      const paypalResponse = await initializePayPalPayment(priceUsd, order._id);

      if (paypalResponse.success) {
        // Save paypal order id in our order
        await dataStore.updateOrder(order._id, {
          paymentStatus: 'pending',
        });

        return NextResponse.json({
          orderId: order._id,
          paypalUrl: paypalResponse.approvalUrl,
        });
      }

      return NextResponse.json(
        { error: paypalResponse.error || 'Failed to initialize PayPal payment' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
