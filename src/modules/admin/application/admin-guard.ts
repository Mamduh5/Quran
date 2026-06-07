import { isAdminEnabled } from "@/modules/shared/config/env";

export type AdminAccess =
  | { enabled: true }
  | {
      enabled: false;
      reason: string;
    };

export type AdminSessionView = {
  email: string;
};

export function getAdminMutationAccess(): AdminAccess {
  if (isAdminEnabled()) {
    return { enabled: true };
  }

  return {
    enabled: false,
    reason:
      "Admin mutations are disabled. Set ADMIN_IMPORTS_ENABLED=true only after admin auth and the import source have been reviewed."
  };
}

export function requireAdminMutationAccess(
  session: AdminSessionView | null
): asserts session is AdminSessionView {
  if (!session) {
    throw new Error("Admin authentication is required.");
  }

  const access = getAdminMutationAccess();
  if (!access.enabled) {
    throw new Error(access.reason);
  }
}
