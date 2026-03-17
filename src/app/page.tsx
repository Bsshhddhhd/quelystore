'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  provider: 'email' | 'discord';
}

export default function Home() {
  const searchParams = useSearchParams();
  const forbidden = searchParams.get('error') === 'forbidden';
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await fetch('/api/auth/session');
      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600">Discord Bot Store</h1>
          <div className="flex gap-4">
            {user ? (
              <>
                <span className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm">
                  {user.name}
                </span>
                <button onClick={handleLogout} className="btn-outline">
                  تسجيل خروج
                </button>
              </>
            ) : (
              <Link href="/login" className="btn-outline">
                تسجيل الدخول
              </Link>
            )}
            <Link href="/products" className="btn-outline">
              المتجر
            </Link>
            {user?.role === 'admin' && (
              <Link href="/admin" className="btn-primary">
                لوحة التحكم
              </Link>
            )}
          </div>
        </div>
      </nav>

      {forbidden && (
        <div className="container mx-auto px-4 pt-4">
          <div className="bg-amber-100 border border-amber-300 text-amber-900 px-4 py-3 rounded-lg">
            هذا الحساب لا يملك صلاحية الدخول إلى لوحة التحكم.
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="section container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-white">
            <h2 className="text-5xl font-bold mb-6">
              🤖 أفضل متجر بوتات Discord
            </h2>
            <p className="text-xl mb-8 opacity-90">
              اختر من آلاف البوتات المميزة وادفع بأمان عبر طرق دفع متعددة
            </p>
            <div className="flex gap-4">
              <Link href="/products" className="btn bg-white text-purple-600 hover:bg-gray-100">
                تسوق الآن
              </Link>
              <button className="btn border-2 border-white text-white hover:bg-white hover:text-purple-600">
                اعرف المزيد
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg p-8 shadow-2xl">
            <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center text-4xl">
              🎵
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white section container mx-auto px-4 py-20">
        <h2 className="section-title">المميزات</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '🔒', title: 'دفع آمن', desc: 'تشفير عالي المستوى لحماية بيانات العميل' },
            { icon: '⚡', title: 'تسليم فوري', desc: 'احصل على منتجك فوراً بعد إتمام الدفع' },
            { icon: '💬', title: 'دعم Discord', desc: 'احصل على دعم فوري عبر Discord' },
          ].map((feature, idx) => (
            <div key={idx} className="card text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Payment Methods */}
      <section className="section container mx-auto px-4 py-20">
        <h2 className="section-title text-white">طرق الدفع المتاحة</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { name: 'Bank Transfer', desc: 'تحويل بنكي كويتي' },
            { name: 'Stripe', desc: 'بطاقات / Apple Pay / Google Pay' },
            { name: 'PayPal', desc: 'حساب باي بال' },
            { name: 'Mastercard', desc: 'بطاقة ماستر كارد' },
          ].map((method, idx) => (
            <div key={idx} className="bg-white rounded-lg p-6 text-center shadow-lg">
              <h3 className="text-xl font-bold mb-2 text-purple-600">{method.name}</h3>
              <p className="text-gray-600">{method.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white section container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6 gradient-text">جاهز للبدء؟</h2>
        <p className="text-xl text-gray-600 mb-8">
          تصفح آلاف البوتات المميزة واختر المفضل لديك
        </p>
        <Link href="/products" className="btn-primary">
          اذهب للمتجر الآن
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2024 Discord Bot Store. جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}
