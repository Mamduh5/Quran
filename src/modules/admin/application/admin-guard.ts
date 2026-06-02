import { isAdminEnabled } from "@/modules/shared/config/env";

export type AdminAccess =
  | { enabled: true }
  | {
      enabled: false;
      reason: string;
    };

export function getAdminAccess(): AdminAccess {
  if (isAdminEnabled()) {
    return { enabled: true };
  }

  return {
    enabled: false,
    reason:
      "Admin mutations are disabled. Set ADMIN_IMPORTS_ENABLED=true only in a trusted environment."
  };
}
