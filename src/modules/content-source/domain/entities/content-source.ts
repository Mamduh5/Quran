import type {
  ContentType,
  TrustStatus
} from "@/modules/shared/domain/content-types";

export type ContentSourceProps = {
  id: string;
  name: string;
  provider: string;
  contentType: ContentType;
  language: string | null;
  url: string | null;
  licenseName: string | null;
  licenseUrl: string | null;
  version: string | null;
  trustStatus: TrustStatus;
  notes: string | null;
};

export class ContentSourceEntity {
  constructor(private readonly props: ContentSourceProps) {
    if (!props.name || !props.provider) {
      throw new Error("Content source requires name and provider.");
    }
  }

  get canPublish(): boolean {
    return this.props.trustStatus === "approved";
  }

  get snapshot(): ContentSourceProps {
    return { ...this.props };
  }
}
