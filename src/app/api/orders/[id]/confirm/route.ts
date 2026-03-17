import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserFromRequest } from '@/lib/auth';
import { dataStore } from '@/lib/data';
import { createPurchaseConfirmation, sendDiscordNotification } from '@/utils/discord';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = getSessionUserFromRequest(request);
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await dataStore.getOrderById(params.id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updated = await dataStore.updateOrder(params.id, {
      paymentStatus: 'completed',
    });

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    if (process.env.DISCORD_WEBHOOK_URL) {
      const confirmationMessage = createPurchaseConfirmation({
        customerName: updated.customerName,
        productName: updated.productName,
        orderId: updated._id,
        price: updated.amount,
      });

      await sendDiscordNotification(process.env.DISCORD_WEBHOOK_URL, confirmationMessage);
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Admin confirm order error:', error);
    return NextResponse.json({ error: 'Failed to confirm order' }, { status: 500 });
  }
}
