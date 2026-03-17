export interface DiscordMessage {
  embeds: Array<{
    title: string;
    description?: string;
    color: number;
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    footer?: {
      text: string;
    };
    timestamp?: string;
  }>;
}

export async function sendDiscordNotification(
  webhookUrl: string,
  message: DiscordMessage
) {
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    return true;
  } catch (error) {
    console.error('Failed to send Discord notification:', error);
    return false;
  }
}

export function createOrderNotification(
  orderData: {
    orderId: string;
    productName: string;
    customerName: string;
    discordUsername: string;
    price: number;
    paymentMethod: string;
  }
): DiscordMessage {
  return {
    embeds: [
      {
        title: '🎉 عملية شراء جديدة',
        description: `تم استلام طلب شراء جديد`,
        color: 3447003,
        fields: [
          {
            name: 'معرف الطلب',
            value: orderData.orderId,
            inline: true,
          },
          {
            name: 'المنتج',
            value: orderData.productName,
            inline: true,
          },
          {
            name: 'اسم العميل',
            value: orderData.customerName,
            inline: true,
          },
          {
            name: 'اسم Discord',
            value: orderData.discordUsername,
            inline: true,
          },
          {
            name: 'السعر',
            value: `${orderData.price} د.ك`,
            inline: true,
          },
          {
            name: 'طريقة الدفع',
            value: orderData.paymentMethod,
            inline: true,
          },
        ],
        footer: {
          text: `تاريخ الطلب: ${new Date().toLocaleString('ar-SA')}`,
        },
      },
    ],
  };
}

export function createPurchaseConfirmation(
  customerData: {
    customerName: string;
    productName: string;
    orderId: string;
    price: number;
  }
): DiscordMessage {
  return {
    embeds: [
      {
        title: '✅ تم تأكيد الطلب',
        description: `تم استلام دفعتك بنجاح`,
        color: 15158332,
        fields: [
          {
            name: 'شكراً',
            value: customerData.customerName,
            inline: false,
          },
          {
            name: 'المنتج الذي اشتريته',
            value: customerData.productName,
            inline: false,
          },
          {
            name: 'معرف الطلب',
            value: customerData.orderId,
            inline: true,
          },
          {
            name: 'المبلغ',
            value: `${customerData.price} د.ك`,
            inline: true,
          },
        ],
        footer: {
          text: 'شكراً لتعاملك معنا',
        },
      },
    ],
  };
}
