"use server";

import { redirect } from "next/navigation";

import {
  getAdminAuthConfig,
  normalizeAdminEmail
} from "@/modules/admin/application/admin-auth";
import { verifyAdminPassword } from "@/modules/admin/application/password-hash";
import {
  isValidLoginCsrfToken,
  setAdminSessionCookie
} from "@/modules/admin/infrastructure/next-admin-session";

export async function loginAction(formData: FormData) {
  const config = getAdminAuthConfig();
  if (!config) {
    redirect("/admin/login?error=config");
  }

  const csrfToken = formData.get("csrfToken")?.toString() ?? null;
  if (!isValidLoginCsrfToken(csrfToken, config.secret)) {
    redirect("/admin/login?error=csrf");
  }

  const email = normalizeAdminEmail(formData.get("email")?.toString() ?? "");
  const password = formData.get("password")?.toString() ?? "";
  const passwordMatches = await verifyAdminPassword(
    password,
    config.passwordHash
  );

  if (email !== config.email || !passwordMatches) {
    redirect("/admin/login?error=invalid");
  }

  await setAdminSessionCookie(config.email, config.secret);
  redirect("/admin/imports");
}
