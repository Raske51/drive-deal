import { Env, User } from './types';
import * as jwt from '@tsndr/cloudflare-worker-jwt';

// Simple password hashing using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
}

export async function createToken(user: User, env: Env): Promise<string> {
  return await jwt.sign(
    {
      sub: user.id.toString(),
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    },
    env.JWT_SECRET
  );
}

export async function verifyToken(token: string, env: Env): Promise<User | null> {
  try {
    const isValid = await jwt.verify(token, env.JWT_SECRET);
    if (!isValid) return null;

    const decoded = jwt.decode(token);
    if (!decoded || !decoded.payload || !decoded.payload.sub) return null;

    const user = await env.DB
      .prepare('SELECT * FROM users WHERE id = ?')
      .bind(parseInt(decoded.payload.sub as string))
      .first<User>();

    return user || null;
  } catch (err) {
    return null;
  }
}

export async function authenticateUser(email: string, password: string, env: Env): Promise<User | null> {
  const user = await env.DB
    .prepare('SELECT * FROM users WHERE email = ?')
    .bind(email)
    .first<User & { password_hash: string }>();

  if (!user) return null;

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) return null;

  // Remove password_hash from user object
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
} 