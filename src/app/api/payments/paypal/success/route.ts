import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/data';
import { capturePayPalPayment } from '@/utils/payment';
import { sendDiscordNotification, createPurchaseConfirmation } from '@/utils/discord';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    // PayPal returns token (which is the PayPal Order ID) and PayerID
    const paypalOrderId = searchParams.get('token');
    const payerId = searchParams.get('PayerID');

    if (!paypalOrderId) {
      return NextResponse.redirect(new URL('/?error=missing_token', request.url));
    }

    // Capture the payment with PayPal
    const captureResult = await capturePayPalPayment(paypalOrderId);

    if (!captureResult.success) {
      return NextResponse.redirect(new URL('/?error=capture_failed', request.url));
    }

    // Find our order using the reference_id stored in PayPal's purchase_units
    const referenceId = captureResult.data?.purchase_units?.[0]?.reference_id;
    if (!referenceId) {
      return NextResponse.redirect(new URL('/?error=no_reference', request.url));
    }

    const order = await dataStore.getOrderById(referenceId);

    if (!order) {
      return NextResponse.redirect(new URL('/?error=order_not_found', request.url));
    }

    // Update order status to completed
    await dataStore.updateOrder(order._id, {
      paymentStatus: 'completed',
    });

    // Send confirmation to Discord
    if (process.env.DISCORD_WEBHOOK_URL) {
      const confirmationMessage = createPurchaseConfirmation({
        customerName: order.customerName,
        productName: order.productName,
        orderId: order._id,
        price: order.amount,
      });
      await sendDiscordNotification(process.env.DISCORD_WEBHOOK_URL, confirmationMessage);
    }

    return NextResponse.redirect(
      new URL(`/success?orderId=${order._id}`, request.url)
    );
  } catch (error) {
    console.error('PayPal success callback error:', error);
    return NextResponse.redirect(new URL('/?error=server_error', request.url));
  }
}
