import { redirect } from "next/navigation";

import { loginAction } from "@/app/admin/login/actions";
import {
  getAdminAuthConfig,
  getAdminAuthSetupReason
} from "@/modules/admin/application/admin-auth";
import {
  createLoginCsrfToken,
  getCurrentAdminSession
} from "@/modules/admin/infrastructure/next-admin-session";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  config: "Admin auth is not configured.",
  csrf: "The login request expired. Reload the page and try again.",
  invalid: "Invalid admin email or password."
};

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [session, resolvedSearchParams] = await Promise.all([
    getCurrentAdminSession(),
    searchParams
  ]);

  if (session) {
    redirect("/admin/imports");
  }

  const config = getAdminAuthConfig();
  const setupReason = getAdminAuthSetupReason();
  const csrfToken = config ? createLoginCsrfToken(config.secret) : "";
  const error = resolvedSearchParams.error
    ? errorMessages[resolvedSearchParams.error] ?? errorMessages.invalid
    : null;

  return (
    <main className="mx-auto grid max-w-md gap-6 px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-3xl font-bold text-ink">Admin login</h1>
        <p className="mt-2 text-muted">
          Sign in to view import, verification, source, and report dashboards.
        </p>
      </header>
      {setupReason ? (
        <section className="rounded-lg border border-line bg-panel p-4 text-sm text-muted">
          {setupReason}
        </section>
      ) : null}
      {error ? (
        <section className="rounded-lg border border-line bg-warning-soft p-4 text-sm font-semibold text-ink">
          {error}
        </section>
      ) : null}
      <form action={loginAction} className="grid gap-4 rounded-lg border border-line bg-panel p-5">
        <input name="csrfToken" type="hidden" value={csrfToken} />
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Email
          <input
            autoComplete="username"
            className="focus-ring rounded border border-line bg-white px-3 py-2 font-normal"
            name="email"
            required
            type="email"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Password
          <input
            autoComplete="current-password"
            className="focus-ring rounded border border-line bg-white px-3 py-2 font-normal"
            name="password"
            required
            type="password"
          />
        </label>
        <button
          className="focus-ring rounded bg-accent px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!config}
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
