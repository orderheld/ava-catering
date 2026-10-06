import 'server-only'
import { createHash, timingSafeEqual } from 'node:crypto'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const SESSION_COOKIE = 'ava_admin'
const MAX_AGE = 60 * 60 * 24 * 7

function secret() {
  const s = process.env.AUTH_SECRET
  if (!s || s.length < 32) throw new Error('AUTH_SECRET fehlt oder ist kürzer als 32 Zeichen.')
  return new TextEncoder().encode(s)
}

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  const a = createHash('sha256').update(input).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

export async function createSession() {
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret())
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export async function destroySession() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
}

export async function verifyToken(token: string | undefined) {
  if (!token) return false
  try {
    await jwtVerify(token, secret())
    return true
  } catch {
    return false
  }
}

export async function isAdmin() {
  const jar = await cookies()
  return verifyToken(jar.get(SESSION_COOKIE)?.value)
}

/** In jeder Admin-Server-Action und -Seite aufrufen. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/admin/login')
}
