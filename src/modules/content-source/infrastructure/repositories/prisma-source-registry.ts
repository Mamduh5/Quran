import { prisma } from "@/modules/shared/database/prisma";

export type SourceRegistryItem = {
  id: string;
  name: string;
  provider: string;
  contentType: string;
  language: string | null;
  url: string | null;
  licenseName: string | null;
  licenseUrl: string | null;
  version: string | null;
  trustStatus: string;
  lastImportAt: Date | null;
  lastVerificationAt: Date | null;
  activePublishedImports: number;
};

export async function listSourceRegistry(): Promise<SourceRegistryItem[]> {
  const sources = await prisma.contentSource
    .findMany({
      orderBy: [{ trustStatus: "asc" }, { name: "asc" }],
      include: {
        imports: {
          orderBy: { importedAt: "desc" },
          include: {
            verificationReports: {
              orderBy: { createdAt: "desc" },
              take: 1
            }
          }
        }
      }
    })
    .catch(() => []);

  return sources.map((source) => {
    const latestImport = source.imports[0];
    const latestVerification = source.imports
      .flatMap((contentImport) => contentImport.verificationReports)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    return {
      id: source.id,
      name: source.name,
      provider: source.provider,
      contentType: source.contentType,
      language: source.language,
      url: source.url,
      licenseName: source.licenseName,
      licenseUrl: source.licenseUrl,
      version: source.version,
      trustStatus: source.trustStatus,
      lastImportAt: latestImport?.importedAt ?? null,
      lastVerificationAt: latestVerification?.createdAt ?? null,
      activePublishedImports: source.imports.filter(
        (contentImport) => contentImport.importStatus === "published"
      ).length
    };
  });
}
