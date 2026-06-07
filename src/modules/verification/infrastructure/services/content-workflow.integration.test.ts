import "dotenv/config";

import { execFileSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { SourceFileInput } from "@/modules/shared/validation/content";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const canRunDatabaseTests =
  Boolean(testDatabaseUrl) && /quran_reader_test/.test(testDatabaseUrl ?? "");

const describeDatabase = describe.skipIf(!canRunDatabaseTests);

let prisma: PrismaClient;
let stageImportFromFile: typeof import("./content-importer").stageImportFromFile;
let verifyImport: typeof import("./content-importer").verifyImport;
let publishVerifiedImport: typeof import("./content-importer").publishVerifiedImport;
let PrismaPublicQuranRepository: typeof import("@/modules/quran/infrastructure/repositories/prisma-public-quran-repository").PrismaPublicQuranRepository;
let tempDirectory: string;

describeDatabase("content workflow integration", () => {
  beforeAll(async () => {
    if (!testDatabaseUrl) {
      throw new Error("TEST_DATABASE_URL is required for integration tests.");
    }

    process.env.DATABASE_URL = testDatabaseUrl;
    const prismaCli = path.join(
      process.cwd(),
      "node_modules",
      "prisma",
      "build",
      "index.js"
    );
    execFileSync(process.execPath, [prismaCli, "migrate", "deploy"], {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: testDatabaseUrl },
      stdio: "pipe"
    });

    [{ prisma }, { stageImportFromFile, verifyImport, publishVerifiedImport }, { PrismaPublicQuranRepository }] =
      await Promise.all([
        import("@/modules/shared/database/prisma"),
        import("./content-importer"),
        import("@/modules/quran/infrastructure/repositories/prisma-public-quran-repository")
      ]);

    tempDirectory = await mkdtemp(path.join(tmpdir(), "quran-workflow-"));
  }, 60_000);

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await prisma?.$disconnect();
    if (tempDirectory) {
      await rm(tempDirectory, { force: true, recursive: true });
    }
  });

  it("rejects malformed source data before staging", async () => {
    const filePath = await writeSourceFixture({
      ...sourceFixture({ trustStatus: "approved" }),
      expectedRecords: 2
    });

    await expect(stageImportFromFile(filePath)).rejects.toThrow(
      "Expected 2 rows but received 1"
    );
  });

  it("imports, verifies, publishes, and exposes approved verified rows", async () => {
    const filePath = await writeSourceFixture(
      sourceFixture({ trustStatus: "approved" })
    );

    const stagedImport = await stageImportFromFile(filePath);
    expect(stagedImport.importStatus).toBe("staged");
    expect(stagedImport.totalRecords).toBe(1);
    expect(stagedImport.checksumSummary).toHaveLength(64);

    const verification = await verifyImport(stagedImport.id);
    expect(verification.status).toBe("passed");
    expect(verification.checkedRecords).toBe(1);

    await publishVerifiedImport(stagedImport.id);

    const publishedImport = await prisma.contentImport.findUniqueOrThrow({
      where: { id: stagedImport.id }
    });
    expect(publishedImport.importStatus).toBe("published");

    const ayah = await new PrismaPublicQuranRepository().getAyah(1, 1);
    expect(ayah?.quranText?.text).toBe(TEST_ONLY_ROW_TEXT);
    expect(ayah?.quranText?.source.name).toBe("Tanzil Project Test Fixture");
  });

  it("fails verification when stored text no longer matches its checksum", async () => {
    const filePath = await writeSourceFixture(
      sourceFixture({ trustStatus: "approved" })
    );
    const stagedImport = await stageImportFromFile(filePath);

    await prisma.quranText.updateMany({
      where: { importId: stagedImport.id },
      data: { text: "TEST_ONLY_CHANGED_AFTER_IMPORT" }
    });

    const verification = await verifyImport(stagedImport.id);
    expect(verification.status).toBe("failed");
    expect(verification.differencesFound).toBe(1);

    const failedImport = await prisma.contentImport.findUniqueOrThrow({
      where: { id: stagedImport.id }
    });
    expect(failedImport.importStatus).toBe("failed");
  });

  it("does not publish an unapproved source", async () => {
    const filePath = await writeSourceFixture(
      sourceFixture({ trustStatus: "candidate" })
    );
    const stagedImport = await stageImportFromFile(filePath);

    await verifyImport(stagedImport.id);

    await expect(publishVerifiedImport(stagedImport.id)).rejects.toThrow(
      "Source must be approved"
    );
  });

  it("does not publish before verification passes", async () => {
    const filePath = await writeSourceFixture(
      sourceFixture({ trustStatus: "approved" })
    );
    const stagedImport = await stageImportFromFile(filePath);

    await expect(publishVerifiedImport(stagedImport.id)).rejects.toThrow(
      "Only verified imports can be published"
    );
  });

  it("filters public reads by source, import, active, and verified row state", async () => {
    const filePath = await writeSourceFixture(
      sourceFixture({ trustStatus: "approved" })
    );
    const stagedImport = await stageImportFromFile(filePath);
    const repository = new PrismaPublicQuranRepository();

    expect((await repository.getAyah(1, 1))?.quranText).toBeNull();

    await verifyImport(stagedImport.id);
    await publishVerifiedImport(stagedImport.id);
    expect((await repository.getAyah(1, 1))?.quranText?.text).toBe(
      TEST_ONLY_ROW_TEXT
    );

    await prisma.quranText.updateMany({
      where: { importId: stagedImport.id },
      data: { active: false }
    });
    expect((await repository.getAyah(1, 1))?.quranText).toBeNull();

    await prisma.quranText.updateMany({
      where: { importId: stagedImport.id },
      data: { active: true, verifiedAt: null }
    });
    expect((await repository.getAyah(1, 1))?.quranText).toBeNull();

    await prisma.quranText.updateMany({
      where: { importId: stagedImport.id },
      data: { verifiedAt: new Date() }
    });
    await prisma.contentSource.update({
      where: { id: stagedImport.sourceId },
      data: { trustStatus: "candidate" }
    });
    expect((await repository.getAyah(1, 1))?.quranText).toBeNull();
  });
});

const TEST_ONLY_ROW_TEXT = "TEST_ONLY_QURAN_TEXT_FIXTURE_NOT_RELIGIOUS_CONTENT";

function sourceFixture({
  trustStatus
}: {
  trustStatus: "approved" | "candidate";
}): SourceFileInput {
  return {
    metadata: {
      sourceName: "Tanzil Project Test Fixture",
      provider: "Test Harness",
      contentType: "quran_text",
      language: "ar",
      version: `test-only-${trustStatus}`,
      url: "https://tanzil.net/download/",
      licenseName: "Test fixture only",
      licenseUrl: "https://tanzil.net/docs/Text_License",
      trustStatus,
      notes:
        "Test-only workflow fixture. This is not Quran text and must never be imported into production."
    },
    expectedRecords: 1,
    rows: [
      {
        surahNumber: 1,
        ayahNumber: 1,
        scriptType: "uthmani",
        text: TEST_ONLY_ROW_TEXT
      }
    ]
  };
}

async function writeSourceFixture(sourceFile: SourceFileInput) {
  const filePath = path.join(
    tempDirectory,
    `${sourceFile.metadata.version}.json`
  );
  await writeFile(filePath, `${JSON.stringify(sourceFile, null, 2)}\n`, "utf8");
  return filePath;
}

async function resetDatabase() {
  await prisma.verificationReport.deleteMany();
  await prisma.contentIssueReport.deleteMany();
  await prisma.quranText.deleteMany();
  await prisma.translation.deleteMany();
  await prisma.tafsir.deleteMany();
  await prisma.contentImport.deleteMany();
  await prisma.contentSource.deleteMany();
  await prisma.ayah.deleteMany();
  await prisma.surah.deleteMany();
}
