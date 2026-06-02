export type ReaderOption = {
  id: string;
  label: string;
};

export function ReaderControls({
  translationOptions,
  tafsirOptions,
  selectedTranslationSource,
  selectedTafsirSource
}: {
  translationOptions: ReaderOption[];
  tafsirOptions: ReaderOption[];
  selectedTranslationSource: string;
  selectedTafsirSource: string;
}) {
  return (
    <form className="flex flex-wrap gap-2 text-sm" aria-label="Reader controls">
      <label className="rounded border border-line bg-white px-3 py-2 text-muted">
        Translation{" "}
        <select
          className="bg-white font-semibold text-ink"
          defaultValue={selectedTranslationSource}
          name="translationSource"
        >
          <option value="all">All verified</option>
          {translationOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="rounded border border-line bg-white px-3 py-2 text-muted">
        Tafsir{" "}
        <select
          className="bg-white font-semibold text-ink"
          defaultValue={selectedTafsirSource}
          name="tafsirSource"
        >
          <option value="all">All verified</option>
          {tafsirOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <span className="rounded border border-line bg-white px-3 py-2 text-muted">
        Font: reader default
      </span>
      <button className="focus-ring rounded bg-accent px-3 py-2 font-semibold text-white">
        Apply
      </button>
    </form>
  );
}
