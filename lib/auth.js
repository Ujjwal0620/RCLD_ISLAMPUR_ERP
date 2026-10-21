import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { db } from "./db";

const COOKIE_NAME = "rcld_session";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "development-only-secret");

export async function createSession(user) {
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name
  }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("8h").sign(secret);

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  try {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub) return null;
    return db.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        userRoles: { select: { role: { select: { name: true, permissions: { select: { permission: { select: { key: true } } } } } } } }
      }
    });
  } catch {
    return null;
  }
}
