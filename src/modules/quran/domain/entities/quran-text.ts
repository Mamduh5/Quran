export type QuranTextProps = {
  id: string;
  ayahId: string;
  scriptType: string;
  text: string;
  sourceId: string;
  importId: string;
  checksum: string;
  verifiedAt: Date | null;
  locked: boolean;
  active: boolean;
};

export class QuranTextEntity {
  private readonly props: QuranTextProps;

  constructor(props: QuranTextProps) {
    if (!props.sourceId || !props.importId || !props.checksum) {
      throw new Error("Quran text must include source, import, and checksum.");
    }

    if (!props.locked) {
      throw new Error("Quran text must be locked after import.");
    }

    this.props = { ...props };
  }

  get snapshot(): QuranTextProps {
    return { ...this.props };
  }
}
