'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
}

interface CheckoutForm {
  customerName: string;
  customerEmail: string;
  discordUsername: string;
  discordUserId: string;
  paymentMethod: 'stripe' | 'paypal' | 'bank_transfer';
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('product');

  const [product, setProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<CheckoutForm>({
    customerName: '',
    customerEmail: '',
    discordUsername: '',
    discordUserId: '',
    paymentMethod: 'stripe',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    }
  }, [productId]);

  async function fetchProduct(id: string) {
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      setProduct(data.product);
    } catch (err) {
      setError('فشل جلب المنتج');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          productId,
          productName: product?.name,
          price: product?.price,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشلت عملية الشراء');
      }

      setSuccess(true);
      // Redirect based on payment method
      if (form.paymentMethod === 'stripe') {
        window.location.href = data.stripeUrl;
      } else if (form.paymentMethod === 'paypal') {
        window.location.href = data.paypalUrl;
      } else if (form.paymentMethod === 'bank_transfer') {
        window.location.href = data.bankTransferUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  }

  if (!product && !error) {
    return <div className="text-center py-12">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-purple-600">
            🤖 Discord Bot Store
          </Link>
        </div>
      </header>

      <div className="section container mx-auto px-4 max-w-4xl">
        <div className="flex gap-8">
          {/* Order Summary */}
          <div className="flex-1">
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">ملخص الطلب</h2>

              {product && (
                <>
                  <div className="border-b pb-6 mb-6">
                    <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-4">{product.description}</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span>السعر</span>
                      <span className="font-bold">{product.price} د.ك</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-4 border-t">
                      <span>الإجمالي</span>
                      <span className="text-purple-600">{product.price} د.ك</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Checkout Form */}
          <div className="flex-1">
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">تفاصيل الطلب</h2>

              {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Info */}
                <div>
                  <label className="block text-sm font-semibold mb-2">اسم العميل</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="أدخل اسمك"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="example@gmail.com"
                    value={form.customerEmail}
                    onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                    required
                  />
                </div>

                {/* Discord Info */}
                <div>
                  <label className="block text-sm font-semibold mb-2">اسم Discord</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="your_discord_username"
                    value={form.discordUsername}
                    onChange={(e) => setForm({ ...form, discordUsername: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Discord ID</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="123456789"
                    value={form.discordUserId}
                    onChange={(e) => setForm({ ...form, discordUserId: e.target.value })}
                    required
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-semibold mb-4">طريقة الدفع</label>
                  <div className="space-y-3">
                    {[
                      { id: 'bank_transfer', name: 'تحويل بنكي كويتي', icon: '🏦' },
                      { id: 'stripe', name: 'Stripe - بطاقات / Apple Pay / Google Pay', icon: '💳' },
                      { id: 'paypal', name: 'PayPal', icon: '🅿️' },
                    ].map((method) => (
                      <label key={method.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={form.paymentMethod === method.id}
                          onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as any })}
                          className="mr-3"
                        />
                        <span className="text-lg mr-2">{method.icon}</span>
                        <span>{method.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full btn btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'جاري المعالجة...' : 'الدفع الآن'}
                </button>

                <p className="text-sm text-gray-600 text-center">
                  🔒 دفع آمن 100% - بياناتك محمية
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p>© 2024 Discord Bot Store</p>
        </div>
      </footer>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">جاري التحميل...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
