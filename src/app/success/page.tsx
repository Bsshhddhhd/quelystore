'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center">
      <div className="card max-w-md text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold mb-4 text-green-600">شكراً لطلبك!</h1>

        <p className="text-gray-600 mb-6">
          تم استقبال دفعتك بنجاح وسيتم معالجة طلبك قريباً
        </p>

        {orderId && (
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600">معرف الطلب</p>
            <p className="font-bold text-lg">{orderId}</p>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
          <p className="text-sm font-semibold mb-2">⭐ ماذا بعد؟</p>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>✓ ستتلقى تأكيد عبر البريد الإلكتروني</li>
            <li>✓ سيتم إرسال المنتج عبر Discord</li>
            <li>✓ تواصل معنا للدعم عند الحاجة</li>
          </ul>
        </div>

        <Link href="/products" className="btn-primary">
          العودة للمتجر
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
