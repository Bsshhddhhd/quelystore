import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
});

const DEFAULT_KWD_TO_USD_RATE = 3.25;

export function convertKwdToUsd(amountKwd: number): number {
  const configuredRate = Number(process.env.KWD_TO_USD_RATE || DEFAULT_KWD_TO_USD_RATE);
  const rate = Number.isFinite(configuredRate) && configuredRate > 0
    ? configuredRate
    : DEFAULT_KWD_TO_USD_RATE;

  return Number((amountKwd * rate).toFixed(2));
}

export async function createStripePaymentIntent(
  amount: number,
  currency: string = 'usd',
  orderId?: string,
  productName?: string
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: productName || 'Discord Bot Product',
            },
          },
        },
      ],
      success_url: `${baseUrl}/success?orderId=${orderId || ''}`,
      cancel_url: `${baseUrl}/products?payment=cancelled`,
      metadata: orderId ? { orderId } : undefined,
      payment_intent_data: {
        metadata: orderId ? { orderId } : undefined,
      },
    });

    return { success: true, checkoutUrl: session.url };
  } catch (error) {
    console.error('Stripe error:', error);
    return { success: false, error: 'Failed to create payment intent' };
  }
}

const PAYPAL_BASE_URL = process.env.PAYPAL_SANDBOX === 'true'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json() as { access_token: string };

  return data.access_token;
}

export async function initializePayPalPayment(
  amount: number,
  orderId: string
) {
  try {
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderId,
            amount: {
              currency_code: 'USD',
              value: amount.toFixed(2),
            },
            description: `Order ${orderId}`,
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
              landing_page: 'LOGIN',
              user_action: 'PAY_NOW',
              return_url: `${process.env.NEXT_PUBLIC_API_URL}/api/payments/paypal/success`,
              cancel_url: `${process.env.NEXT_PUBLIC_API_URL}/api/payments/paypal/cancel`,
            },
          },
        },
      }),
    });

    const responseData = await response.json() as {
      id: string;
      links?: Array<{ rel: string; href: string }>;
    };

    // Find the approve link
    const approveLink = responseData.links?.find(
      (link: { rel: string; href: string }) => link.rel === 'payer-action'
    )?.href || responseData.links?.find(
      (link: { rel: string; href: string }) => link.rel === 'approve'
    )?.href;

    if (!approveLink) {
      throw new Error('No approval URL returned from PayPal');
    }

    return {
      success: true,
      paypalOrderId: responseData.id,
      approvalUrl: approveLink,
    };
  } catch (error) {
    console.error('PayPal error:', error);
    return { success: false, error: 'Failed to initialize PayPal payment' };
  }
}

export async function capturePayPalPayment(paypalOrderId: string) {
  try {
    const accessToken = await getPayPalAccessToken();

    const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    const data = await res.json() as { status: string };

    return {
      success: data.status === 'COMPLETED',
      data,
    };
  } catch (error) {
    console.error('PayPal capture error:', error);
    return { success: false, error: 'Failed to capture PayPal payment' };
  }
}

export function generateOrderId(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
