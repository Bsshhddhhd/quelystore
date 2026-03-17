import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/data';
import { sendDiscordNotification } from '@/utils/discord';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { referenceNumber } = await request.json();

    if (!referenceNumber?.trim()) {
      return NextResponse.json({ error: 'رقم الحوالة مطلوب' }, { status: 400 });
    }

    const order = await dataStore.getOrderById(params.id);
    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    // Update order with reference number, status = awaiting_confirmation
    await dataStore.updateOrder(params.id, {
      paymentStatus: 'awaiting_confirmation',
      bankReferenceNumber: referenceNumber,
    });

    // Notify admin on Discord
    if (process.env.DISCORD_WEBHOOK_URL) {
      await sendDiscordNotification(process.env.DISCORD_WEBHOOK_URL, {
        embeds: [
          {
            title: '🏦 تحويل بنكي جديد - يحتاج تأكيد',
            color: 0xf59e0b,
            fields: [
              { name: 'رقم الطلب', value: order._id, inline: true },
              { name: 'المنتج', value: order.productName, inline: true },
              { name: 'المبلغ', value: `${order.amount} د.ك`, inline: true },
              { name: 'العميل', value: order.customerName, inline: true },
              { name: 'البريد', value: order.customerEmail, inline: true },
              { name: '📋 رقم الحوالة', value: referenceNumber, inline: false },
            ],
            timestamp: new Date().toISOString(),
            footer: { text: 'يرجى التحقق وتأكيد الطلب من لوحة التحكم' },
          },
        ],
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bank confirm error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
