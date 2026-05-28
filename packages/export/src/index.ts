import type { ExportType, Presentation } from "@tumbfolio/domain";

export type ExportFormat = ExportType;

export type ExportRequest = {
  presentation: Presentation;
  type: ExportFormat;
  config: Record<string, unknown>;
};

export type ExportResult = {
  mediaType: string;
  filename: string;
  body: Uint8Array;
};

export interface PresentationExporter {
  readonly type: ExportFormat;
  export(request: ExportRequest): Promise<ExportResult>;
}

export const EXPORT_MEDIA_TYPES: Record<ExportFormat, string> = {
  html: "text/html",
  html_zip: "application/zip",
  pdf: "application/pdf",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  nbxp: "application/vnd.tumbfolio.nbxp+zip"
};
