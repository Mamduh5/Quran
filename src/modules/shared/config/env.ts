import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  ADMIN_IMPORTS_ENABLED: z.enum(["true", "false"]).default("false"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional()
});

export type AppEnv = z.infer<typeof envSchema>;

export function getEnv(): AppEnv {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(
      `Invalid environment configuration: ${parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ")}`
    );
  }

  return parsed.data;
}

export function requireDatabaseUrl(): string {
  const env = getEnv();

  if (!env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is required for database scripts. Copy .env.example to .env and configure the database connection."
    );
  }

  return env.DATABASE_URL;
}

export function isAdminEnabled(): boolean {
  return getEnv().ADMIN_IMPORTS_ENABLED === "true";
}
