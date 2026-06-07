export function TranslationBlock({
  text,
  language,
  footnotes
}: {
  text: string;
  language: string;
  footnotes?: string | null;
}) {
  return (
    <section className="border-l-4 border-line bg-white p-4" lang={language}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
        Translation of meaning
      </h3>
      <p className="mt-2 text-ink">{text}</p>
      {footnotes ? (
        <details className="mt-3 rounded border border-line p-3 text-sm">
          <summary className="cursor-pointer font-semibold text-muted">
            Translation footnotes
          </summary>
          <p className="mt-2 whitespace-pre-line text-ink">{footnotes}</p>
        </details>
      ) : null}
    </section>
  );
}
