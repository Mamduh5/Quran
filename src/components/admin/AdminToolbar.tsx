import { logoutAction } from "@/app/admin/actions";
import type { AdminAccess } from "@/modules/admin/application/admin-guard";
import type { AdminSession } from "@/modules/admin/application/admin-auth";
import { getAdminAuthConfig } from "@/modules/admin/application/admin-auth";
import { createLogoutCsrfToken } from "@/modules/admin/infrastructure/next-admin-session";

export function AdminToolbar({
  access,
  session
}: {
  access: AdminAccess;
  session: AdminSession;
}) {
  const config = getAdminAuthConfig();
  const csrfToken = config ? createLogoutCsrfToken(config.secret) : "";

  return (
    <section className="rounded-lg border border-line bg-panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">
            Signed in as {session.email}
          </p>
          <p className="text-sm text-muted">
            Mutations: {access.enabled ? "enabled" : "disabled"}
          </p>
        </div>
        <form action={logoutAction}>
          <input name="csrfToken" type="hidden" value={csrfToken} />
          <button className="focus-ring rounded border border-line bg-white px-3 py-2 text-sm font-semibold text-accent">
            Logout
          </button>
        </form>
      </div>
    </section>
  );
}
