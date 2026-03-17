import fs from 'fs/promises';
import path from 'path';

const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');

export interface UserRecord {
  _id: string;
  name: string;
  email: string;
  provider: 'email' | 'discord';
  passwordHash?: string;
  discordId?: string;
  avatarUrl?: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

function getAdminEmails(): string[] {
  const single = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const many = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set([single, ...many].filter(Boolean)));
}

export function resolveRoleByEmail(email: string): 'admin' | 'user' {
  const normalized = email.trim().toLowerCase();
  return getAdminEmails().includes(normalized) ? 'admin' : 'user';
}

export async function getUsers(): Promise<UserRecord[]> {
  try {
    const data = await fs.readFile(USERS_PATH, 'utf-8');
    return JSON.parse(data) as UserRecord[];
  } catch {
    return [];
  }
}

async function saveUsers(users: UserRecord[]): Promise<void> {
  await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2));
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const users = await getUsers();
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === normalized) || null;
}

export async function upsertDiscordUser(params: {
  email: string;
  name: string;
  discordId: string;
  avatarUrl?: string;
}): Promise<UserRecord> {
  const users = await getUsers();
  const normalized = params.email.trim().toLowerCase();
  const now = new Date().toISOString();

  const index = users.findIndex(
    (u) => u.email.toLowerCase() === normalized || u.discordId === params.discordId
  );

  const role = resolveRoleByEmail(normalized);

  if (index >= 0) {
    users[index] = {
      ...users[index],
      name: params.name,
      email: normalized,
      provider: 'discord',
      discordId: params.discordId,
      avatarUrl: params.avatarUrl,
      role,
      updatedAt: now,
    };
    await saveUsers(users);
    return users[index];
  }

  const user: UserRecord = {
    _id: Date.now().toString(),
    name: params.name,
    email: normalized,
    provider: 'discord',
    discordId: params.discordId,
    avatarUrl: params.avatarUrl,
    role,
    createdAt: now,
    updatedAt: now,
  };

  users.push(user);
  await saveUsers(users);
  return user;
}

export async function createEmailUser(params: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<UserRecord> {
  const users = await getUsers();
  const normalized = params.email.trim().toLowerCase();

  if (users.some((u) => u.email.toLowerCase() === normalized)) {
    throw new Error('EMAIL_EXISTS');
  }

  const now = new Date().toISOString();
  const role = resolveRoleByEmail(normalized);

  const user: UserRecord = {
    _id: Date.now().toString(),
    name: params.name,
    email: normalized,
    provider: 'email',
    passwordHash: params.passwordHash,
    role,
    createdAt: now,
    updatedAt: now,
  };

  users.push(user);
  await saveUsers(users);
  return user;
}

export async function syncUserRoleByEmail(email: string): Promise<UserRecord | null> {
  const users = await getUsers();
  const normalized = email.trim().toLowerCase();
  const index = users.findIndex((u) => u.email.toLowerCase() === normalized);

  if (index === -1) {
    return null;
  }

  const expectedRole = resolveRoleByEmail(normalized);
  if (users[index].role !== expectedRole) {
    users[index] = {
      ...users[index],
      role: expectedRole,
      updatedAt: new Date().toISOString(),
    };
    await saveUsers(users);
  }

  return users[index];
}
