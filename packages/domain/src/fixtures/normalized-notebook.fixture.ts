import { SourceNotebookSchema } from "../notebook/index.js";
import { NotebookCellSchema } from "../notebook/index.js";
import { NormalizedOutputSchema } from "../notebook/index.js";
import { NotebookAnalysisSummarySchema } from "../notebook/index.js";

export const FIXTURE_NOTEBOOK_ID = "00000000-0000-4000-8000-000000000010";
export const FIXTURE_PROJECT_ID = "00000000-0000-4000-8000-000000000001";
export const FIXTURE_CELL_IDS = {
  markdown: "00000000-0000-4000-8000-000000000020",
  code: "00000000-0000-4000-8000-000000000021"
} as const;
export const FIXTURE_OUTPUT_IDS = {
  text: "00000000-0000-4000-8000-000000000030",
  stdout: "00000000-0000-4000-8000-000000000031",
  image: "00000000-0000-4000-8000-000000000032",
  dataframe: "00000000-0000-4000-8000-000000000033",
  error: "00000000-0000-4000-8000-000000000034"
} as const;

export const sourceNotebookFixture = SourceNotebookSchema.parse({
  id: FIXTURE_NOTEBOOK_ID,
  projectId: FIXTURE_PROJECT_ID,
  originalFilename: "analysis.ipynb",
  storageKey: "notebooks/2026-01/abc123-analysis.ipynb",
  fileSizeBytes: 10240,
  sha256: "a".repeat(64),
  nbformat: 4,
  nbformatMinor: 5,
  validationStatus: "valid",
  processingStatus: "processed",
  cellCount: 2,
  outputCount: 5,
  detectedMimeTypes: ["text/plain", "text/html", "image/png", "text/markdown"],
  metadata: {},
  createdAt: "2026-05-28T10:00:00.000Z",
  updatedAt: "2026-05-28T10:05:00.000Z"
});

export const notebookCellFixtures = [
  NotebookCellSchema.parse({
    id: FIXTURE_CELL_IDS.markdown,
    sourceNotebookId: FIXTURE_NOTEBOOK_ID,
    cellIndex: 0,
    cellType: "markdown",
    source: "# Analysis\n\nThis is a markdown cell.",
    classification: "narrative_markdown",
    isNoise: false,
    metadata: {},
    createdAt: "2026-05-28T10:00:00.000Z",
    updatedAt: "2026-05-28T10:00:00.000Z"
  }),
  NotebookCellSchema.parse({
    id: FIXTURE_CELL_IDS.code,
    sourceNotebookId: FIXTURE_NOTEBOOK_ID,
    cellIndex: 1,
    cellType: "code",
    source: 'print("hello world")',
    language: "python",
    executionCount: 1,
    classification: "analysis_code",
    isNoise: false,
    metadata: {},
    createdAt: "2026-05-28T10:00:00.000Z",
    updatedAt: "2026-05-28T10:00:00.000Z"
  })
];

export const normalizedOutputFixtures = [
  NormalizedOutputSchema.parse({
    id: FIXTURE_OUTPUT_IDS.text,
    sourceNotebookId: FIXTURE_NOTEBOOK_ID,
    sourceCellId: FIXTURE_CELL_IDS.code,
    outputIndex: 0,
    outputType: "execute_result",
    mimeType: "text/plain",
    availableMimeTypes: ["text/plain"],
    data: { "text/plain": "hello world" },
    text: "hello world",
    priority: 0,
    isNoise: false,
    renderStrategy: "plain_text",
    createdAt: "2026-05-28T10:00:00.000Z",
    updatedAt: "2026-05-28T10:00:00.000Z"
  }),
  NormalizedOutputSchema.parse({
    id: FIXTURE_OUTPUT_IDS.stdout,
    sourceNotebookId: FIXTURE_NOTEBOOK_ID,
    sourceCellId: FIXTURE_CELL_IDS.code,
    outputIndex: 1,
    outputType: "stream",
    mimeType: "text/plain",
    availableMimeTypes: ["text/plain"],
    data: { "text/plain": "progress: 100%" },
    text: "progress: 100%",
    priority: 1,
    isNoise: false,
    renderStrategy: "stream",
    createdAt: "2026-05-28T10:00:00.000Z",
    updatedAt: "2026-05-28T10:00:00.000Z"
  })
];

export const notebookAnalysisSummaryFixture = NotebookAnalysisSummarySchema.parse({
  sourceNotebookId: FIXTURE_NOTEBOOK_ID,
  validationStatus: "valid",
  cellCount: 2,
  outputCount: 2,
  cellsByType: { markdown: 1, code: 1, raw: 0, unknown: 0 },
  outputsByType: { execute_result: 1, display_data: 0, stream: 1, error: 0, unknown: 0 },
  detectedMimeTypes: ["text/plain"],
  unsupportedMimeTypes: [],
  warnings: [],
  errors: []
});
