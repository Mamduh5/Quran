"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminAuthConfig } from "@/modules/admin/application/admin-auth";
import {
  clearAdminSessionCookie,
  isValidLogoutCsrfToken,
  requireAdminMutationSession
} from "@/modules/admin/infrastructure/next-admin-session";
import {
  publishVerifiedImport,
  verifyImport
} from "@/modules/verification/infrastructure/services/content-importer";

export async function verifyImportAction(formData: FormData) {
  await requireAdminMutationSession();
  const importId = formData.get("importId")?.toString();

  if (!importId) {
    throw new Error("importId is required.");
  }

  await verifyImport(importId);
  revalidatePath("/admin/imports");
  revalidatePath("/admin/verification");
}

export async function publishImportAction(formData: FormData) {
  await requireAdminMutationSession();
  const importId = formData.get("importId")?.toString();

  if (!importId) {
    throw new Error("importId is required.");
  }

  await publishVerifiedImport(importId);
  revalidatePath("/admin/imports");
  revalidatePath("/admin/verification");
  revalidatePath("/quran");
  revalidatePath("/sources");
}

export async function logoutAction(formData: FormData) {
  const config = getAdminAuthConfig();
  const csrfToken = formData.get("csrfToken")?.toString() ?? null;

  if (config && !isValidLogoutCsrfToken(csrfToken, config.secret)) {
    throw new Error("Invalid logout request.");
  }

  await clearAdminSessionCookie();
  redirect("/admin/login");
}
