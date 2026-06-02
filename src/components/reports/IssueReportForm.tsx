"use client";

import { useFormStatus } from "react-dom";

import { createIssueReport } from "@/app/reports/actions";

function SubmitButton() {
  const status = useFormStatus();
  return (
    <button
      className="focus-ring rounded bg-accent px-4 py-2 font-semibold text-white disabled:opacity-60"
      disabled={status.pending}
      type="submit"
    >
      {status.pending ? "Submitting" : "Submit report"}
    </button>
  );
}

export function IssueReportForm({
  ayahReference
}: {
  ayahReference?: string;
}) {
  return (
    <form action={createIssueReport} className="grid gap-4">
      <label className="grid gap-2 text-sm font-semibold text-ink">
        Ayah reference
        <input
          className="focus-ring rounded border border-line bg-white px-3 py-2 font-normal"
          defaultValue={ayahReference}
          name="ayahReference"
          placeholder="2:255"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-ink">
        Content type
        <select
          className="focus-ring rounded border border-line bg-white px-3 py-2 font-normal"
          defaultValue="other"
          name="contentType"
        >
          <option value="quran_text">Arabic Quran text</option>
          <option value="translation">Translation of meaning</option>
          <option value="tafsir">Tafsir / explanation</option>
          <option value="source_metadata">Source metadata</option>
          <option value="display">Display issue</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-ink">
        Message
        <textarea
          className="focus-ring min-h-36 rounded border border-line bg-white px-3 py-2 font-normal"
          maxLength={2000}
          minLength={10}
          name="message"
          required
        />
      </label>
      <p className="text-sm text-muted">
        Reports create review items only. They never edit authoritative content.
      </p>
      <SubmitButton />
    </form>
  );
}
