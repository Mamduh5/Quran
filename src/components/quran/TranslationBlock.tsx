export function TranslationBlock({
  text,
  language
}: {
  text: string;
  language: string;
}) {
  return (
    <section className="border-l-4 border-line bg-white p-4" lang={language}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
        Translation of meaning
      </h3>
      <p className="mt-2 text-ink">{text}</p>
    </section>
  );
}
