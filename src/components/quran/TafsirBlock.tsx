export function TafsirBlock({
  text,
  language,
  title
}: {
  text: string;
  language: string;
  title: string;
}) {
  return (
    <details className="bg-warning-soft p-4" lang={language} open>
      <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-muted">
        Tafsir / Explanation: {title}
      </summary>
      <p className="mt-2 text-ink">{text}</p>
    </details>
  );
}
