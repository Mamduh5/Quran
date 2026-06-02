export type TranslationProps = {
  id: string;
  ayahId: string;
  language: string;
  translatorName: string | null;
  text: string;
  sourceId: string;
  importId: string;
  checksum: string;
  active: boolean;
};

export class TranslationEntity {
  constructor(private readonly props: TranslationProps) {
    if (!props.sourceId || !props.importId || !props.checksum) {
      throw new Error("Translation must include source, import, and checksum.");
    }
  }

  get snapshot(): TranslationProps {
    return { ...this.props };
  }
}
