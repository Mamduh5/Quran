"use server";

import { revalidatePath } from "next/cache";

import { getAdminAccess } from "@/modules/admin/application/admin-guard";
import {
  publishVerifiedImport,
  verifyImport
} from "@/modules/verification/infrastructure/services/content-importer";

function requireAdminMutation() {
  const access = getAdminAccess();
  if (!access.enabled) {
    throw new Error(access.reason);
  }
}

export async function verifyImportAction(formData: FormData) {
  requireAdminMutation();
  const importId = formData.get("importId")?.toString();

  if (!importId) {
    throw new Error("importId is required.");
  }

  await verifyImport(importId);
  revalidatePath("/admin/imports");
  revalidatePath("/admin/verification");
}

export async function publishImportAction(formData: FormData) {
  requireAdminMutation();
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
