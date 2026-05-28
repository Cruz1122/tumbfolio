export const ExportType = {
  Html: "html",
  HtmlZip: "html_zip",
  Pdf: "pdf",
  Pptx: "pptx",
  Nbxp: "nbxp"
} as const;

export type ExportType = (typeof ExportType)[keyof typeof ExportType];
