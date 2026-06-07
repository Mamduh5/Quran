import "dotenv/config";

import { z } from "zod";

const optionalNonEmptyString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional()
);

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional()
);

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  TEST_DATABASE_URL: z.string().min(1).optional(),
  AUTH_SECRET: optionalNonEmptyString,
  ADMIN_EMAIL: optionalNonEmptyString,
  ADMIN_PASSWORD_HASH: optionalNonEmptyString,
  ADMIN_IMPORTS_ENABLED: z.enum(["true", "false"]).default("false"),
  ADMIN_ROUTE_CHECK_PASSWORD: optionalNonEmptyString,
  NEXT_PUBLIC_APP_URL: optionalUrl,
  QF_CLIENT_ID: optionalNonEmptyString,
  QF_CLIENT_SECRET: optionalNonEmptyString,
  QF_ENV: z.enum(["prelive", "production"]).default("prelive"),
  QF_TAFSIR_ID: optionalNonEmptyString,
  QF_TAFSIR_LANGUAGE: optionalNonEmptyString,
  QF_TAFSIR_PERSISTENCE_REVIEWED: z.enum(["true", "false"]).default("false")
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

export function isQuranFoundationTafsirPersistenceReviewed(): boolean {
  return getEnv().QF_TAFSIR_PERSISTENCE_REVIEWED === "true";
}
