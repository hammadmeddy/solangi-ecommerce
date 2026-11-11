import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { AuthRole } from "@/lib/auth";

export const SESSION_COOKIE = "solangi_session";

export type SessionPayload = {
  sub: string;
  phone: string;
  name: string;
  role: AuthRole;
};

function secretKey() {
  const secret = process.env.SOLANGI_AUTH_SECRET || "solangi-local-dev-secret";
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    phone: payload.phone,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub || typeof payload.phone !== "string") return null;
    return {
      sub: payload.sub,
      phone: payload.phone,
      name: typeof payload.name === "string" ? payload.name : "Solangi Member",
      role: (payload.role as AuthRole) || "customer",
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
