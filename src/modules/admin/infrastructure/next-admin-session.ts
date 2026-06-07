import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_LOGIN_CSRF_PURPOSE,
  ADMIN_LOGOUT_CSRF_PURPOSE,
  ADMIN_SESSION_COOKIE,
  createAdminCsrfToken,
  createAdminSessionToken,
  getAdminAuthConfig,
  verifyAdminCsrfToken,
  verifyAdminSessionToken,
  type AdminSession
} from "@/modules/admin/application/admin-auth";
import {
  requireAdminMutationAccess
} from "@/modules/admin/application/admin-guard";

const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export async function getCurrentAdminSession(): Promise<AdminSession | null> {
  const config = getAdminAuthConfig();
  if (!config) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  return verifyAdminSessionToken(token, config.secret);
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getCurrentAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export async function requireAdminMutationSession(): Promise<AdminSession> {
  const session = await getCurrentAdminSession();
  requireAdminMutationAccess(session);
  return session;
}

export async function setAdminSessionCookie(email: string, secret: string) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(email, secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/admin"
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/admin"
  });
}

export function createLoginCsrfToken(secret: string): string {
  return createAdminCsrfToken(secret, ADMIN_LOGIN_CSRF_PURPOSE);
}

export function createLogoutCsrfToken(secret: string): string {
  return createAdminCsrfToken(secret, ADMIN_LOGOUT_CSRF_PURPOSE);
}

export function isValidLoginCsrfToken(token: string | null, secret: string) {
  return verifyAdminCsrfToken(token, secret, ADMIN_LOGIN_CSRF_PURPOSE);
}

export function isValidLogoutCsrfToken(token: string | null, secret: string) {
  return verifyAdminCsrfToken(token, secret, ADMIN_LOGOUT_CSRF_PURPOSE);
}
