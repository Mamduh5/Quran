import "dotenv/config";

import { prisma } from "@/modules/shared/database/prisma";

const baseUrl = (process.argv[2] ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
  /\/$/,
  ""
);

const routes = [
  "/",
  "/quran",
  "/quran/1",
  "/quran/1/1",
  "/search",
  "/sources",
  "/reports/new",
  "/admin/imports",
  "/admin/verification",
  "/admin/sources",
  "/admin/reports"
];

async function main() {
  const responses = new Map<string, string>();

  for (const route of routes) {
    const response = await fetch(`${baseUrl}${route}`);
    const body = await response.text();
    responses.set(route, body);

    if (response.status !== 200) {
      throw new Error(`${route} returned HTTP ${response.status}.`);
    }

    console.log(`${response.status} ${route}`);
  }

  const publishedAyah = await prisma.quranText.findFirst({
    where: {
      active: true,
      verifiedAt: { not: null },
      source: { trustStatus: "approved" },
      import: { importStatus: "published" },
      ayah: {
        ayahNumber: 1,
        surah: { number: 1 }
      }
    },
    include: {
      source: true
    }
  });

  if (publishedAyah) {
    assertBodyIncludes("/quran/1", responses, publishedAyah.text);
    assertBodyIncludes("/quran/1/1", responses, publishedAyah.text);
    assertBodyIncludes("/quran/1/1", responses, publishedAyah.source.name);

    const searchToken = publishedAyah.text.split(/\s+/)[0];
    const searchResponse = await fetch(
      `${baseUrl}/search?q=${encodeURIComponent(searchToken)}`
    );
    const searchBody = await searchResponse.text();

    if (searchResponse.status !== 200) {
      throw new Error(`/search?q=<published-token> returned HTTP ${searchResponse.status}.`);
    }

    if (!searchBody.includes(publishedAyah.source.name)) {
      throw new Error("Search did not show the published Quran source.");
    }

    console.log("Imported content proof: /quran/1, /quran/1/1, and /search show published text.");
  } else {
    console.log("No published ayah found; route checks covered safe empty states only.");
  }

  await submitIssueReport();
}

function assertBodyIncludes(
  route: string,
  responses: Map<string, string>,
  expected: string
) {
  const body = responses.get(route);
  if (!body?.includes(expected)) {
    throw new Error(`${route} did not include expected published content.`);
  }
}

async function submitIssueReport() {
  const [reportsBefore, quranRowsBefore] = await Promise.all([
    prisma.contentIssueReport.count(),
    prisma.quranText.count()
  ]);
  const formPage = await fetch(`${baseUrl}/reports/new?ayah=1:1`);
  const formHtml = await formPage.text();
  const actionId = formHtml.match(/name="(\$ACTION_ID_[^"]+)"/)?.[1];

  if (!actionId) {
    throw new Error("Issue report form did not include a server action id.");
  }

  const formData = new FormData();
  formData.append(actionId, "");
  formData.append("ayahReference", "1:1");
  formData.append("contentType", "display");
  formData.append(
    "message",
    "Automated HTTP route check: verify report creation does not mutate content."
  );

  const response = await fetch(`${baseUrl}/reports/new?ayah=1:1`, {
    method: "POST",
    body: formData,
    redirect: "follow"
  });

  if (response.status !== 200 || !response.url.includes("status=created")) {
    throw new Error(
      `Issue report submission failed: HTTP ${response.status} ${response.url}`
    );
  }

  const [reportsAfter, quranRowsAfter] = await Promise.all([
    prisma.contentIssueReport.count(),
    prisma.quranText.count()
  ]);

  if (reportsAfter !== reportsBefore + 1) {
    throw new Error("Issue report submission did not create exactly one report.");
  }

  if (quranRowsAfter !== quranRowsBefore) {
    throw new Error("Issue report submission mutated Quran text rows.");
  }

  console.log("Issue report proof: created one report without mutating Quran rows.");
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
