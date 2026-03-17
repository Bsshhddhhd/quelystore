import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'auth_token';
const TOKEN_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  provider: 'email' | 'discord';
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return secret;
}

export function createAuthToken(user: SessionUser): string {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name, role: user.role, provider: user.provider },
    getJwtSecret(),
    { expiresIn: TOKEN_EXPIRY_SECONDS }
  );
}

export function verifyAuthToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as {
      sub: string; email: string; name: string; role: 'admin' | 'user'; provider: 'email' | 'discord';
    };
    return { id: decoded.sub, email: decoded.email, name: decoded.name, role: decoded.role, provider: decoded.provider };
  } catch {
    return null;
  }
}

export function attachAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: TOKEN_EXPIRY_SECONDS,
    path: '/',
  });
  return response;
}

export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set(AUTH_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
  });
  return response;
}

export function getSessionUserFromRequest(request: NextRequest): SessionUser | null {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyAuthToken(token);
}
