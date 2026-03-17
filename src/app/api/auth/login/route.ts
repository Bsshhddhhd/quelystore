import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { attachAuthCookie, createAuthToken, SessionUser } from '@/lib/auth';
import { getUserByEmail, syncUserRoleByEmail } from '@/lib/users';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!email || !password) {
      return NextResponse.json({ error: 'الإيميل وكلمة المرور مطلوبان' }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
    }

    const effectiveUser = (await syncUserRoleByEmail(user.email)) || user;

    const sessionUser: SessionUser = {
      id: effectiveUser._id,
      email: effectiveUser.email,
      name: effectiveUser.name,
      role: effectiveUser.role,
      provider: effectiveUser.provider,
    };

    const token = createAuthToken(sessionUser);
    const response = NextResponse.json({ success: true, user: sessionUser });
    return attachAuthCookie(response, token);
  } catch {
    return NextResponse.json({ error: 'فشل تسجيل الدخول' }, { status: 500 });
  }
}
