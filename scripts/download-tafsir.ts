import "dotenv/config";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { sha256Bytes } from "@/modules/shared/crypto/checksum";
import {
  getEnv,
  isQuranFoundationTafsirPersistenceReviewed
} from "@/modules/shared/config/env";
import {
  buildQuranFoundationTafsirSourceFile,
  findQuranFoundationTafsirResource
} from "@/modules/tafsir/infrastructure/services/quran-foundation-tafsir-source";

const AUTH_BASE_BY_ENV = {
  production: "https://oauth2.quran.foundation",
  prelive: "https://prelive-oauth2.quran.foundation"
} as const;
const API_BASE_BY_ENV = {
  production: "https://apis.quran.foundation",
  prelive: "https://apis-prelive.quran.foundation"
} as const;

async function main() {
  const env = getEnv();
  const tafsirId = Number.parseInt(env.QF_TAFSIR_ID ?? "169", 10);
  const language = env.QF_TAFSIR_LANGUAGE ?? "en";

  if (!env.QF_CLIENT_ID || !env.QF_CLIENT_SECRET) {
    throw new Error(
      "Quran Foundation tafsir download requires QF_CLIENT_ID and QF_CLIENT_SECRET. Request Content API access, then rerun after reviewing storage terms."
    );
  }

  if (!isQuranFoundationTafsirPersistenceReviewed()) {
    throw new Error(
      "QF_TAFSIR_PERSISTENCE_REVIEWED=true is required before storing Quran Foundation tafsir responses. Their developer terms prohibit caching/storing QF Content longer than 1 week unless expressly permitted."
    );
  }

  const downloadedAt = new Date().toISOString();
  const originalFileChecksums: Record<string, string> = {};
  const originalDirectory = path.join(
    process.cwd(),
    "data",
    "sources",
    "original",
    "quran-foundation",
    "tafsir",
    String(tafsirId)
  );
  const processedDirectory = path.join(
    process.cwd(),
    "data",
    "sources",
    "processed",
    "quran-foundation",
    "tafsir"
  );
  await mkdir(originalDirectory, { recursive: true });
  await mkdir(processedDirectory, { recursive: true });

  const token = await fetchQuranFoundationToken(env);
  const [resources, tafsir] = await Promise.all([
    fetchQuranFoundationJson(env, token, `/content/api/v4/resources/tafsirs?language=${language}`),
    fetchQuranFoundationJson(
      env,
      token,
      `/content/api/v4/tafsirs/${tafsirId}?fields=text,resource_name,verse_key,language_name`
    )
  ]);

  await writeOriginalJson(
    originalDirectory,
    "resources-tafsirs.json",
    resources,
    originalFileChecksums
  );
  await writeOriginalJson(
    originalDirectory,
    `tafsir-${tafsirId}.json`,
    tafsir,
    originalFileChecksums
  );

  const resource = findQuranFoundationTafsirResource(resources, tafsirId);
  const processedSource = buildQuranFoundationTafsirSourceFile({
    resource,
    response: tafsir,
    downloadedAt,
    originalFileChecksums,
    language
  });
  const processedJson = `${JSON.stringify(processedSource, null, 2)}\n`;
  const processedFileSha256 = sha256Bytes(new TextEncoder().encode(processedJson));
  const processedPath = path.join(processedDirectory, `tafsir-${tafsirId}.json`);
  const manifestPath = path.join(processedDirectory, `tafsir-${tafsirId}.manifest.json`);

  await writeFile(processedPath, processedJson, "utf8");
  await writeFile(
    manifestPath,
    `${JSON.stringify(
      {
        sourceName: processedSource.metadata.sourceName,
        provider: processedSource.metadata.provider,
        tafsirId,
        apiDocsUrl: processedSource.metadata.apiDocsUrl,
        termsUrl: processedSource.metadata.termsUrl,
        trustStatus: processedSource.metadata.trustStatus,
        downloadedAt,
        originalDirectory: path.relative(process.cwd(), originalDirectory),
        originalFileChecksums,
        processedPath: path.relative(process.cwd(), processedPath),
        processedFileSha256,
        rowCount: processedSource.rows.length,
        licenseReviewRequired:
          "Quran Foundation terms require storage permission before persistent publication."
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  console.log(`Wrote processed tafsir import file to ${path.relative(process.cwd(), processedPath)}.`);
  console.log(`Processed file SHA-256: ${processedFileSha256}`);
  console.log(`Rows: ${processedSource.rows.length}`);
  console.log("Trust status: candidate; do not publish without approved storage terms.");
}

async function fetchQuranFoundationToken(env: ReturnType<typeof getEnv>) {
  const authBaseUrl = AUTH_BASE_BY_ENV[env.QF_ENV];
  const basicAuth = Buffer.from(
    `${env.QF_CLIENT_ID}:${env.QF_CLIENT_SECRET}`
  ).toString("base64");
  const response = await fetch(`${authBaseUrl}/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "content"
    })
  });

  if (!response.ok) {
    throw new Error(`Quran Foundation token request failed: HTTP ${response.status}`);
  }

  const payload = (await response.json()) as { access_token?: string };
  if (!payload.access_token) {
    throw new Error("Quran Foundation token response did not include access_token.");
  }

  return payload.access_token;
}

async function fetchQuranFoundationJson(
  env: ReturnType<typeof getEnv>,
  token: string,
  pathName: string
) {
  const apiBaseUrl = API_BASE_BY_ENV[env.QF_ENV];
  const response = await fetch(`${apiBaseUrl}${pathName}`, {
    headers: {
      "x-auth-token": token,
      "x-client-id": env.QF_CLIENT_ID ?? ""
    }
  });

  if (!response.ok) {
    throw new Error(
      `Quran Foundation request failed: HTTP ${response.status} ${pathName}`
    );
  }

  return response.json() as Promise<unknown>;
}

async function writeOriginalJson(
  directory: string,
  fileName: string,
  payload: unknown,
  checksums: Record<string, string>
) {
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  const filePath = path.join(directory, fileName);
  await writeFile(filePath, json, "utf8");
  checksums[path.relative(process.cwd(), filePath)] = sha256Bytes(
    new TextEncoder().encode(json)
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
