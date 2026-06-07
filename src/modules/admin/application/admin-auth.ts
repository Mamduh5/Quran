import type { AppEnv } from "@/modules/shared/config/env";
import { getEnv } from "@/modules/shared/config/env";
import { createSignedToken, verifySignedToken } from "./signed-token";

export const ADMIN_SESSION_COOKIE = "quran_admin_session";
export const ADMIN_SESSION_PURPOSE = "admin-session";
export const ADMIN_LOGIN_CSRF_PURPOSE = "admin-login";
export const ADMIN_LOGOUT_CSRF_PURPOSE = "admin-logout";

const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;
const CSRF_MAX_AGE_MS = 20 * 60 * 1000;

export type AdminAuthConfig = {
  secret: string;
  email: string;
  passwordHash: string;
};

export type AdminSession = {
  email: string;
  expiresAt: Date;
};

export function getAdminAuthConfig(env: AppEnv = getEnv()) {
  if (!env.AUTH_SECRET || !env.ADMIN_EMAIL || !env.ADMIN_PASSWORD_HASH) {
    return null;
  }

  return {
    secret: env.AUTH_SECRET,
    email: normalizeAdminEmail(env.ADMIN_EMAIL),
    passwordHash: env.ADMIN_PASSWORD_HASH
  };
}

export function getAdminAuthSetupReason(env: AppEnv = getEnv()): string | null {
  const missing = [
    !env.AUTH_SECRET ? "AUTH_SECRET" : null,
    !env.ADMIN_EMAIL ? "ADMIN_EMAIL" : null,
    !env.ADMIN_PASSWORD_HASH ? "ADMIN_PASSWORD_HASH" : null
  ].filter(Boolean);

  if (missing.length === 0) {
    return null;
  }

  return `Admin auth is not configured. Set ${missing.join(", ")} before signing in.`;
}

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function createAdminSessionToken(
  email: string,
  secret: string,
  now = Date.now()
): string {
  return createSignedToken(
    {
      purpose: ADMIN_SESSION_PURPOSE,
      email: normalizeAdminEmail(email),
      expiresAt: now + SESSION_MAX_AGE_MS,
      issuedAt: now
    },
    secret
  );
}

export function verifyAdminSessionToken(
  token: string,
  secret: string,
  now = Date.now()
): AdminSession | null {
  const payload = verifySignedToken(token, secret, ADMIN_SESSION_PURPOSE, now);

  if (!payload?.email) {
    return null;
  }

  return {
    email: payload.email,
    expiresAt: new Date(payload.expiresAt)
  };
}

export function createAdminCsrfToken(
  secret: string,
  purpose: typeof ADMIN_LOGIN_CSRF_PURPOSE | typeof ADMIN_LOGOUT_CSRF_PURPOSE,
  now = Date.now()
): string {
  return createSignedToken(
    {
      purpose,
      expiresAt: now + CSRF_MAX_AGE_MS,
      issuedAt: now
    },
    secret
  );
}

export function verifyAdminCsrfToken(
  token: string | null | undefined,
  secret: string,
  purpose: typeof ADMIN_LOGIN_CSRF_PURPOSE | typeof ADMIN_LOGOUT_CSRF_PURPOSE,
  now = Date.now()
): boolean {
  if (!token) {
    return false;
  }

  return verifySignedToken(token, secret, purpose, now) !== null;
}
