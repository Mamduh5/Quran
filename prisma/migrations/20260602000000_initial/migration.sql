CREATE TYPE "ContentType" AS ENUM ('quran_text', 'translation', 'tafsir', 'audio', 'metadata', 'source_metadata', 'display', 'other');
CREATE TYPE "TrustStatus" AS ENUM ('candidate', 'approved', 'deprecated', 'rejected');
CREATE TYPE "ImportStatus" AS ENUM ('staged', 'verified', 'failed', 'published', 'archived');
CREATE TYPE "VerificationStatus" AS ENUM ('passed', 'failed', 'warning');
CREATE TYPE "IssueStatus" AS ENUM ('open', 'reviewing', 'resolved', 'rejected');

CREATE TABLE "Surah" (
  "id" TEXT NOT NULL,
  "number" INTEGER NOT NULL,
  "nameArabic" TEXT,
  "nameTransliteration" TEXT,
  "nameEnglish" TEXT,
  "revelationType" TEXT,
  "ayahCount" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Surah_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Ayah" (
  "id" TEXT NOT NULL,
  "surahId" TEXT NOT NULL,
  "ayahNumber" INTEGER NOT NULL,
  "juz" INTEGER,
  "hizb" INTEGER,
  "page" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Ayah_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContentSource" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "contentType" "ContentType" NOT NULL,
  "language" TEXT,
  "url" TEXT,
  "licenseName" TEXT,
  "licenseUrl" TEXT,
  "version" TEXT NOT NULL DEFAULT '',
  "trustStatus" "TrustStatus" NOT NULL DEFAULT 'candidate',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ContentSource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContentImport" (
  "id" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "contentType" "ContentType" NOT NULL,
  "sourceVersion" TEXT,
  "importStatus" "ImportStatus" NOT NULL DEFAULT 'staged',
  "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "importedBy" TEXT,
  "totalRecords" INTEGER NOT NULL,
  "checksumSummary" TEXT,
  "manifestJson" JSONB,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ContentImport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuranText" (
  "id" TEXT NOT NULL,
  "ayahId" TEXT NOT NULL,
  "scriptType" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "importId" TEXT NOT NULL,
  "checksum" TEXT NOT NULL,
  "verifiedAt" TIMESTAMP(3),
  "locked" BOOLEAN NOT NULL DEFAULT true,
  "active" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "QuranText_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Translation" (
  "id" TEXT NOT NULL,
  "ayahId" TEXT NOT NULL,
  "language" TEXT NOT NULL,
  "translatorName" TEXT,
  "text" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "importId" TEXT NOT NULL,
  "checksum" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Tafsir" (
  "id" TEXT NOT NULL,
  "ayahId" TEXT NOT NULL,
  "language" TEXT NOT NULL,
  "tafsirName" TEXT NOT NULL,
  "authorName" TEXT,
  "text" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "importId" TEXT NOT NULL,
  "checksum" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Tafsir_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VerificationReport" (
  "id" TEXT NOT NULL,
  "importId" TEXT NOT NULL,
  "status" "VerificationStatus" NOT NULL,
  "differencesFound" INTEGER NOT NULL,
  "checkedRecords" INTEGER NOT NULL,
  "reportJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VerificationReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContentIssueReport" (
  "id" TEXT NOT NULL,
  "ayahId" TEXT,
  "contentType" "ContentType" NOT NULL,
  "contentId" TEXT,
  "message" TEXT NOT NULL,
  "status" "IssueStatus" NOT NULL DEFAULT 'open',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ContentIssueReport_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Surah_number_key" ON "Surah"("number");
CREATE UNIQUE INDEX "Ayah_surahId_ayahNumber_key" ON "Ayah"("surahId", "ayahNumber");
CREATE INDEX "Ayah_ayahNumber_idx" ON "Ayah"("ayahNumber");
CREATE UNIQUE INDEX "ContentSource_name_provider_contentType_version_key" ON "ContentSource"("name", "provider", "contentType", "version");
CREATE INDEX "ContentImport_contentType_importStatus_idx" ON "ContentImport"("contentType", "importStatus");
CREATE INDEX "ContentImport_sourceId_idx" ON "ContentImport"("sourceId");
CREATE UNIQUE INDEX "QuranText_ayahId_scriptType_sourceId_importId_key" ON "QuranText"("ayahId", "scriptType", "sourceId", "importId");
CREATE INDEX "QuranText_active_idx" ON "QuranText"("active");
CREATE INDEX "QuranText_checksum_idx" ON "QuranText"("checksum");
CREATE UNIQUE INDEX "Translation_ayahId_language_sourceId_importId_key" ON "Translation"("ayahId", "language", "sourceId", "importId");
CREATE INDEX "Translation_active_idx" ON "Translation"("active");
CREATE INDEX "Translation_checksum_idx" ON "Translation"("checksum");
CREATE UNIQUE INDEX "Tafsir_ayahId_language_tafsirName_sourceId_importId_key" ON "Tafsir"("ayahId", "language", "tafsirName", "sourceId", "importId");
CREATE INDEX "Tafsir_active_idx" ON "Tafsir"("active");
CREATE INDEX "Tafsir_checksum_idx" ON "Tafsir"("checksum");
CREATE INDEX "VerificationReport_status_idx" ON "VerificationReport"("status");
CREATE INDEX "ContentIssueReport_status_idx" ON "ContentIssueReport"("status");
CREATE INDEX "ContentIssueReport_contentType_idx" ON "ContentIssueReport"("contentType");

ALTER TABLE "Ayah" ADD CONSTRAINT "Ayah_surahId_fkey" FOREIGN KEY ("surahId") REFERENCES "Surah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContentImport" ADD CONSTRAINT "ContentImport_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ContentSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "QuranText" ADD CONSTRAINT "QuranText_ayahId_fkey" FOREIGN KEY ("ayahId") REFERENCES "Ayah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "QuranText" ADD CONSTRAINT "QuranText_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ContentSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "QuranText" ADD CONSTRAINT "QuranText_importId_fkey" FOREIGN KEY ("importId") REFERENCES "ContentImport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_ayahId_fkey" FOREIGN KEY ("ayahId") REFERENCES "Ayah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ContentSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_importId_fkey" FOREIGN KEY ("importId") REFERENCES "ContentImport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Tafsir" ADD CONSTRAINT "Tafsir_ayahId_fkey" FOREIGN KEY ("ayahId") REFERENCES "Ayah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Tafsir" ADD CONSTRAINT "Tafsir_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ContentSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Tafsir" ADD CONSTRAINT "Tafsir_importId_fkey" FOREIGN KEY ("importId") REFERENCES "ContentImport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VerificationReport" ADD CONSTRAINT "VerificationReport_importId_fkey" FOREIGN KEY ("importId") REFERENCES "ContentImport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentIssueReport" ADD CONSTRAINT "ContentIssueReport_ayahId_fkey" FOREIGN KEY ("ayahId") REFERENCES "Ayah"("id") ON DELETE SET NULL ON UPDATE CASCADE;
