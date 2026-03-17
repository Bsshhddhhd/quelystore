import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { attachAuthCookie, createAuthToken, SessionUser } from '@/lib/auth';
import { upsertDiscordUser } from '@/lib/users';

interface DiscordTokenResponse {
  access_token: string;
}

interface DiscordUser {
  id: string;
  username: string;
  global_name?: string;
  email?: string;
  avatar?: string;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const storedState = request.cookies.get('discord_oauth_state')?.value;

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL('/login?error=discord_state', request.url));
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI || `${request.nextUrl.origin}/api/auth/discord/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/login?error=discord_config', request.url));
  }

  try {
    const tokenBody = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    });

    const tokenRes = await axios.post<DiscordTokenResponse>(
      'https://discord.com/api/oauth2/token',
      tokenBody.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = tokenRes.data.access_token;
    const userRes = await axios.get<DiscordUser>('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const discordUser = userRes.data;
    const email = discordUser.email || `${discordUser.id}@discord.local`;
    const displayName = discordUser.global_name || discordUser.username;
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : undefined;

    const user = await upsertDiscordUser({
      email,
      name: displayName,
      discordId: discordUser.id,
      avatarUrl,
    });

    const sessionUser: SessionUser = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      provider: user.provider,
    };

    const token = createAuthToken(sessionUser);
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('discord_oauth_state', '', {
      maxAge: 0,
      path: '/',
    });
    return attachAuthCookie(response, token);
  } catch {
    return NextResponse.redirect(new URL('/login?error=discord_failed', request.url));
  }
}
