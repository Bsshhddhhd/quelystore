'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Order {
  _id: string;
  customerName: string;
  productName: string;
  amount: number;
  paymentStatus: string;
}

interface BankInfo {
  bankName: string;
  accountName: string;
  accountNumber: string;
  iban: string;
  whatsapp: string;
}

export default function BankTransferPage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchOrder();
    fetchBankInfo();
  }, []);

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/orders/${params.orderId}`);
      const data = await res.json();
      setOrder(data.order);
    } catch {
      setError('فشل جلب بيانات الطلب');
    }
  }

  async function fetchBankInfo() {
    try {
      const res = await fetch('/api/bank-info');
      const data = await res.json();
      setBankInfo(data);
    } catch {
      setError('فشل جلب بيانات الحساب البنكي');
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleSubmitReference(e: React.FormEvent) {
    e.preventDefault();
    if (!referenceNumber.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/${params.orderId}/bank-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referenceNumber }),
      });
      if (!res.ok) throw new Error('فشل الإرسال');
      setSubmitted(true);
    } catch {
      setError('حدث خطأ أثناء الإرسال، حاول مرة أخرى');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-600 mb-3">تم إرسال رقم الحوالة</h1>
          <p className="text-gray-600 mb-6">
            سيتم التحقق من التحويل وتفعيل طلبك خلال دقائق.
            <br />
            سنتواصل معك عبر البريد الإلكتروني.
          </p>
          <Link href="/" className="btn btn-primary w-full block text-center">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-purple-600">
            🤖 Discord Bot Store
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10 max-w-2xl">
        {/* Order Summary */}
        {order && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">ملخص الطلب</h2>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>رقم الطلب</span>
              <span className="font-mono text-xs">{order._id}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>المنتج</span>
              <span className="font-semibold">{order.productName}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-purple-600 mt-3 pt-3 border-t">
              <span>المبلغ المطلوب</span>
              <span>{order.amount} د.ك</span>
            </div>
          </div>
        )}

        {/* Bank Details */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h1 className="text-xl font-bold mb-1">🏦 بيانات التحويل البنكي</h1>
          <p className="text-gray-500 text-sm mb-6">حوّل المبلغ لهذا الحساب ثم أرسل رقم الحوالة أدناه</p>

          {bankInfo ? (
            <div className="space-y-4">
              {[
                { label: 'اسم البنك', value: bankInfo.bankName },
                { label: 'اسم صاحب الحساب', value: bankInfo.accountName },
                { label: 'رقم الحساب', value: bankInfo.accountNumber, copyable: true },
                { label: 'رقم الآيبان (IBAN)', value: bankInfo.iban, copyable: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                    <p className="font-semibold text-gray-800 font-mono">{item.value}</p>
                  </div>
                  {item.copyable && (
                    <button
                      onClick={() => copyToClipboard(item.value, item.label)}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium px-3 py-1 rounded border border-purple-200 hover:bg-purple-50 transition"
                    >
                      {copied === item.label ? '✅ تم النسخ' : 'نسخ'}
                    </button>
                  )}
                </div>
              ))}

              {bankInfo.whatsapp && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <span className="text-2xl">💬</span>
                  <div>
                    <p className="text-sm text-green-700 font-medium">تواصل معنا على واتساب</p>
                    <a
                      href={`https://wa.me/${bankInfo.whatsapp.replace('+', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 font-bold hover:underline"
                    >
                      {bankInfo.whatsapp}
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">جاري التحميل...</div>
          )}
        </div>

        {/* Reference Number Form */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold mb-1">📋 أرسل رقم الحوالة</h2>
          <p className="text-gray-500 text-sm mb-5">
            بعد إتمام التحويل، أدخل رقم الحوالة/المرجع لنتمكن من تأكيد طلبك
          </p>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmitReference} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">رقم الحوالة / المرجع</label>
              <input
                type="text"
                className="input"
                placeholder="مثال: TRF20260317001"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className={`w-full btn btn-primary ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {submitting ? 'جاري الإرسال...' : 'تأكيد التحويل'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
