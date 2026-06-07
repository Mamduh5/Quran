import { describe, expect, it } from "vitest";

import {
  createAdminCsrfToken,
  createAdminSessionToken,
  verifyAdminCsrfToken,
  verifyAdminSessionToken
} from "@/modules/admin/application/admin-auth";
import {
  requireAdminMutationAccess
} from "@/modules/admin/application/admin-guard";
import {
  hashAdminPassword,
  verifyAdminPassword
} from "@/modules/admin/application/password-hash";

describe("admin auth", () => {
  it("generates and verifies scrypt password hashes", async () => {
    const hash = await hashAdminPassword("test-only-password");

    await expect(verifyAdminPassword("test-only-password", hash)).resolves.toBe(
      true
    );
    await expect(verifyAdminPassword("wrong-test-password", hash)).resolves.toBe(
      false
    );
    expect(hash).not.toContain("test-only-password");
  });

  it("accepts valid admin session tokens and rejects tampered tokens", () => {
    const token = createAdminSessionToken(
      "admin@example.test",
      "test-only-secret",
      1_000
    );

    expect(
      verifyAdminSessionToken(token, "test-only-secret", 2_000)?.email
    ).toBe("admin@example.test");
    expect(
      verifyAdminSessionToken(`${token}tampered`, "test-only-secret", 2_000)
    ).toBeNull();
  });

  it("rejects expired CSRF tokens", () => {
    const token = createAdminCsrfToken(
      "test-only-secret",
      "admin-login",
      1_000
    );

    expect(
      verifyAdminCsrfToken(token, "test-only-secret", "admin-login", 2_000)
    ).toBe(true);
    expect(
      verifyAdminCsrfToken(
        token,
        "test-only-secret",
        "admin-login",
        60 * 60 * 1000
      )
    ).toBe(false);
  });

  it("blocks server mutations without auth and without ADMIN_IMPORTS_ENABLED", () => {
    const previous = process.env.ADMIN_IMPORTS_ENABLED;
    process.env.ADMIN_IMPORTS_ENABLED = "false";

    expect(() => requireAdminMutationAccess(null)).toThrow(
      "Admin authentication is required"
    );
    expect(() =>
      requireAdminMutationAccess({ email: "admin@example.test" })
    ).toThrow("Admin mutations are disabled");

    process.env.ADMIN_IMPORTS_ENABLED = "true";
    expect(() =>
      requireAdminMutationAccess({ email: "admin@example.test" })
    ).not.toThrow();

    if (previous === undefined) {
      delete process.env.ADMIN_IMPORTS_ENABLED;
    } else {
      process.env.ADMIN_IMPORTS_ENABLED = previous;
    }
  });
});
