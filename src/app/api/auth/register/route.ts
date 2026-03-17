import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { attachAuthCookie, createAuthToken, SessionUser } from '@/lib/auth';
import { createEmailUser } from '@/lib/users';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createEmailUser({ name, email, passwordHash });

    const sessionUser: SessionUser = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      provider: user.provider,
    };

    const token = createAuthToken(sessionUser);
    const response = NextResponse.json({ success: true, user: sessionUser });
    return attachAuthCookie(response, token);
  } catch (error) {
    if (error instanceof Error && error.message === 'EMAIL_EXISTS') {
      return NextResponse.json({ error: 'الإيميل مستخدم مسبقاً' }, { status: 409 });
    }
    return NextResponse.json({ error: 'فشل إنشاء الحساب' }, { status: 500 });
  }
}
