"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/modules/shared/database/prisma";
import {
  ayahReferenceSchema,
  issueReportInputSchema
} from "@/modules/shared/validation/content";

export async function createIssueReport(formData: FormData) {
  const parsed = issueReportInputSchema.safeParse({
    ayahReference: formData.get("ayahReference")?.toString() || undefined,
    contentType: formData.get("contentType")?.toString() || "other",
    contentId: formData.get("contentId")?.toString() || undefined,
    message: formData.get("message")?.toString() || ""
  });

  if (!parsed.success) {
    redirect("/reports/new?status=invalid");
  }

  let ayahId: string | undefined;
  const ayahReference = parsed.data.ayahReference?.trim();

  if (ayahReference) {
    const reference = ayahReferenceSchema.safeParse(ayahReference);
    if (!reference.success) {
      redirect("/reports/new?status=invalid-reference");
    }

    const ayah = await prisma.ayah
      .findFirst({
        where: {
          ayahNumber: reference.data.ayahNumber,
          surah: { number: reference.data.surahNumber }
        },
        select: { id: true }
      })
      .catch(() => null);

    ayahId = ayah?.id;
  }

  await prisma.contentIssueReport
    .create({
      data: {
        ayahId,
        contentType: parsed.data.contentType,
        contentId: parsed.data.contentId,
        message: parsed.data.message
      }
    })
    .catch(() => {
      redirect("/reports/new?status=database-unavailable");
    });

  redirect("/reports/new?status=created");
}
