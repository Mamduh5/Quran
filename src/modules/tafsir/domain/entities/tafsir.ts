export type TafsirProps = {
  id: string;
  ayahId: string;
  language: string;
  tafsirName: string;
  authorName: string | null;
  text: string;
  sourceId: string;
  importId: string;
  checksum: string;
  active: boolean;
};

export class TafsirEntity {
  constructor(private readonly props: TafsirProps) {
    if (!props.sourceId || !props.importId || !props.checksum) {
      throw new Error("Tafsir must include source, import, and checksum.");
    }
  }

  get snapshot(): TafsirProps {
    return { ...this.props };
  }
}
