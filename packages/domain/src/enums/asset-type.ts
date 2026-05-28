export const AssetType = {
  SourceNotebook: "source_notebook",
  OutputImage: "output_image",
  OutputSvg: "output_svg",
  OutputHtml: "output_html",
  DataFrame: "data_frame",
  Thumbnail: "thumbnail",
  ExportHtml: "export_html",
  ExportZip: "export_zip",
  ExportPdf: "export_pdf",
  ExportPptx: "export_pptx",
  ExportNbxp: "export_nbxp",
  ThemeAsset: "theme_asset",
  Unknown: "unknown"
} as const;

export type AssetType = (typeof AssetType)[keyof typeof AssetType];
