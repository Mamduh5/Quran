import { prisma } from "@/modules/shared/database/prisma";

export async function listIssueReports() {
  return prisma.contentIssueReport
    .findMany({
      orderBy: { createdAt: "desc" },
      include: {
        ayah: {
          include: {
            surah: true
          }
        }
      }
    })
    .catch(() => []);
}
