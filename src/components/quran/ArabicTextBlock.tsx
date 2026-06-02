export function ArabicTextBlock({ text }: { text: string }) {
  return (
    <div
      className="rounded-lg border border-line bg-white px-5 py-6 text-right text-3xl leading-loose text-ink sm:text-4xl"
      dir="rtl"
      lang="ar"
    >
      {text}
    </div>
  );
}
