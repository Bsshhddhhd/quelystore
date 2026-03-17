'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

type AuthMode = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const errorCode = searchParams.get('error');
    if (!errorCode) return;

    if (errorCode.startsWith('discord')) {
      setError('فشل تسجيل الدخول عبر Discord. تأكد من إعدادات Discord OAuth.');
    }
  }, [searchParams]);

  async function handleEmailAuth(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' ? { email, password } : { name, email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشلت العملية');
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-700 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-7">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-gray-900">دخول المتجر</h1>
          <p className="text-gray-600 mt-2">سريع، بسيط، ومباشر</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-5 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setMode('login')}
            className={`py-2 rounded-lg font-semibold transition ${
              mode === 'login' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
            }`}
            type="button"
          >
            تسجيل دخول
          </button>
          <button
            onClick={() => setMode('register')}
            className={`py-2 rounded-lg font-semibold transition ${
              mode === 'register' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
            }`}
            type="button"
          >
            إنشاء حساب
          </button>
        </div>

        <a
          href="/api/auth/discord/login"
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold mb-5 transition"
        >
          <span>🎮</span>
          <span>الدخول عبر Discord</span>
        </a>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-semibold mb-1">الاسم</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسمك الكامل"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-1">الإيميل</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">كلمة المرور</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

          <button
            disabled={loading}
            className="w-full btn btn-primary disabled:opacity-60"
            type="submit"
          >
            {loading ? 'جاري المعالجة...' : mode === 'login' ? 'دخول بالإيميل' : 'إنشاء الحساب'}
          </button>
        </form>

        <div className="text-center mt-5">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            الرجوع للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
