import { ExportJobSchema, type ExportJob } from "../exports/index.js";

export const exportJobFixture: ExportJob = ExportJobSchema.parse({
  id: "00000000-0000-4000-8000-000000000090",
  presentationId: "00000000-0000-4000-8000-000000000040",
  exportType: "pdf",
  status: "completed",
  config: {
    exportType: "pdf",
    includeSpeakerNotes: false,
    includeAppendix: true,
    includeHiddenBlocks: false,
    includeCode: true,
    pageSize: "A4",
    printBackground: true
  },
  resultAssetId: "00000000-0000-4000-8000-000000000091",
  startedAt: "2026-05-28T10:10:00.000Z",
  completedAt: "2026-05-28T10:12:00.000Z",
  createdAt: "2026-05-28T10:09:00.000Z",
  updatedAt: "2026-05-28T10:12:00.000Z"
});

export const pendingExportJobFixture: ExportJob = ExportJobSchema.parse({
  id: "00000000-0000-4000-8000-000000000092",
  presentationId: "00000000-0000-4000-8000-000000000040",
  exportType: "html",
  status: "queued",
  config: {
    exportType: "html",
    includeSpeakerNotes: false,
    includeAppendix: true,
    includeHiddenBlocks: false,
    includeCode: true
  },
  createdAt: "2026-05-28T10:15:00.000Z",
  updatedAt: "2026-05-28T10:15:00.000Z"
});

export const failedExportJobFixture: ExportJob = ExportJobSchema.parse({
  id: "00000000-0000-4000-8000-000000000093",
  presentationId: "00000000-0000-4000-8000-000000000040",
  exportType: "pptx",
  status: "failed",
  config: {
    exportType: "pptx",
    includeSpeakerNotes: true,
    includeAppendix: true,
    includeHiddenBlocks: false,
    includeCode: true,
    rasterizeComplexHtml: true
  },
  errorCode: "RENDER_TIMEOUT",
  errorMessage: "Slide 3 rendering exceeded timeout",
  startedAt: "2026-05-28T10:20:00.000Z",
  createdAt: "2026-05-28T10:19:00.000Z",
  updatedAt: "2026-05-28T10:21:00.000Z"
});
