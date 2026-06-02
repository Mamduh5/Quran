import { prisma } from "@/modules/shared/database/prisma";

export async function listImportDashboardItems() {
  return prisma.contentImport
    .findMany({
      orderBy: { importedAt: "desc" },
      include: {
        source: true,
        verificationReports: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    })
    .catch(() => []);
}

export async function listVerificationDashboardItems() {
  return prisma.verificationReport
    .findMany({
      orderBy: { createdAt: "desc" },
      include: {
        import: {
          include: {
            source: true
          }
        }
      }
    })
    .catch(() => []);
}
