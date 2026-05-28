import type { CellType, OutputType, RenderStrategy } from "@tumbfolio/domain";
import { parseNotebookJson } from "./parse-notebook.js";
import { selectPrimaryMimeType } from "./mime-priority.js";
import { normalizeSource } from "./normalize-source.js";

export const NotebookReasonCode = {
  InvalidJson: "INVALID_JSON",
  UnsupportedNbformat: "UNSUPPORTED_NBFORMAT",
  EmptyNotebook: "EMPTY_NOTEBOOK",
  NoCells: "NO_CELLS",
  NoOutputs: "NO_OUTPUTS",
  FileTooLarge: "FILE_TOO_LARGE",
} as const;

export type NotebookReasonCodeType =
  (typeof NotebookReasonCode)[keyof typeof NotebookReasonCode];

export type NotebookValidationIssue = {
  code: NotebookReasonCodeType;
  message: string;
};

export type NotebookAnalysisSummary = {
  valid: boolean;
  nbformat: number | null;
  nbformatMinor?: number;
  cellCount: number;
  outputCount: number;
  cellTypes: Record<CellType, number>;
  outputTypes: Record<OutputType, number>;
  detectedMimeTypes: string[];
  errors: NotebookValidationIssue[];
  warnings: NotebookValidationIssue[];
};

export type AnalyzeNotebookJsonOptions = {
  maxFileSizeBytes?: number;
};

type RawNotebook = {
  nbformat?: unknown;
  nbformat_minor?: unknown;
  cells?: unknown;
};

type RawCell = {
  cell_type?: unknown;
  source?: unknown;
  outputs?: unknown;
};

type RawOutput = {
  output_type?: unknown;
  data?: unknown;
  name?: unknown;
};

export { normalizeSource as normalizeNotebookSource };
export { normalizeSource };
export { selectPrimaryMimeType };
export { parseNotebookJson };
export type { ParsedNotebook, ParsedNotebookCell } from "./parse-notebook.js";
export type { ParsedNotebookOutput } from "./normalize-output.js";

export function classifyCellType(cellType: unknown): CellType {
  if (cellType === "markdown" || cellType === "code" || cellType === "raw") {
    return cellType;
  }

  return "unknown";
}

export function classifyOutputType(outputType: unknown): OutputType {
  if (
    outputType === "execute_result" ||
    outputType === "display_data" ||
    outputType === "stream" ||
    outputType === "error"
  ) {
    return outputType;
  }

  return "unknown";
}

export function chooseRenderStrategy(mimeType: string | undefined, outputType: OutputType): RenderStrategy {
  if (outputType === "stream") return "stream";
  if (outputType === "error") return "error";
  if (!mimeType) return "unsupported";

  if (mimeType === "text/plain") return "plain_text";
  if (mimeType === "text/html") return "html_sanitized";
  if (mimeType === "image/png" || mimeType === "image/jpeg") return "image";
  if (mimeType === "image/svg+xml") return "svg";
  if (mimeType === "text/latex") return "latex";
  if (mimeType === "text/markdown") return "markdown";

  return "unsupported";
}

export function analyzeNotebookJson(
  rawJson: string,
  options: AnalyzeNotebookJsonOptions = {},
): NotebookAnalysisSummary {
  const baseErrors: NotebookValidationIssue[] = [];
  const warnings: NotebookValidationIssue[] = [];

  if (
    options.maxFileSizeBytes !== undefined &&
    new TextEncoder().encode(rawJson).byteLength > options.maxFileSizeBytes
  ) {
    baseErrors.push({
      code: NotebookReasonCode.FileTooLarge,
      message: "Notebook exceeds the maximum allowed size.",
    });
  }

  let notebook: RawNotebook;

  try {
    notebook = JSON.parse(rawJson) as RawNotebook;
  } catch {
    return buildInvalidSummary(baseErrors, [
      {
        code: NotebookReasonCode.InvalidJson,
        message: "Notebook is not valid JSON.",
      },
    ]);
  }

  if (typeof notebook.nbformat !== "number") {
    return buildInvalidSummary(baseErrors, [
      {
        code: NotebookReasonCode.UnsupportedNbformat,
        message: "Notebook must declare a numeric nbformat.",
      },
    ]);
  }

  if (!Array.isArray(notebook.cells)) {
    return buildInvalidSummary(
      baseErrors,
      [
        {
          code: NotebookReasonCode.NoCells,
          message: "Notebook cells payload is missing or invalid.",
        },
      ],
      notebook.nbformat,
      notebook.nbformat_minor,
    );
  }

  const cellTypes: Record<CellType, number> = {
    markdown: 0,
    code: 0,
    raw: 0,
    unknown: 0
  };

  const outputTypes: Record<OutputType, number> = {
    execute_result: 0,
    display_data: 0,
    stream: 0,
    error: 0,
    unknown: 0
  };

  const mimeTypes = new Set<string>();
  let outputCount = 0;
  let hasMeaningfulMarkdown = false;

  for (const cell of notebook.cells as RawCell[]) {
    const cellType = classifyCellType(cell.cell_type);
    cellTypes[cellType] += 1;

    if (
      cellType === "markdown" &&
      normalizeSource(cell.source).trim().length > 0
    ) {
      hasMeaningfulMarkdown = true;
    }

    if (Array.isArray(cell.outputs)) {
      for (const output of cell.outputs as RawOutput[]) {
        outputCount += 1;
        const outputType = classifyOutputType(output.output_type);
        outputTypes[outputType] += 1;

        const mimeType = selectPrimaryMimeType(output.data);
        if (mimeType) {
          mimeTypes.add(mimeType);
        }
      }
    }
  }

  const errors = [...baseErrors];
  if (notebook.cells.length === 0) {
    errors.push({
      code: NotebookReasonCode.EmptyNotebook,
      message: "Notebook has no cells.",
    });
  }
  if (outputCount === 0 && hasMeaningfulMarkdown) {
    warnings.push({
      code: NotebookReasonCode.NoOutputs,
      message: "Notebook has no executed outputs, but markdown content is available.",
    });
  }

  return {
    valid: errors.length === 0,
    nbformat: notebook.nbformat,
    cellCount: notebook.cells.length,
    outputCount,
    cellTypes,
    outputTypes,
    detectedMimeTypes: [...mimeTypes].sort(),
    errors,
    warnings,
    ...(typeof notebook.nbformat_minor === "number"
      ? { nbformatMinor: notebook.nbformat_minor }
      : {}),
  };
}

function buildInvalidSummary(
  existingErrors: NotebookValidationIssue[],
  errors: NotebookValidationIssue[],
  nbformat: number | null = null,
  nbformatMinor?: unknown,
): NotebookAnalysisSummary {
  return {
    valid: false,
    nbformat,
    cellCount: 0,
    outputCount: 0,
    cellTypes: {
      markdown: 0,
      code: 0,
      raw: 0,
      unknown: 0
    },
    outputTypes: {
      execute_result: 0,
      display_data: 0,
      stream: 0,
      error: 0,
      unknown: 0
    },
    detectedMimeTypes: [],
    errors: [...existingErrors, ...errors],
    warnings: [],
    ...(typeof nbformatMinor === "number" ? { nbformatMinor } : {}),
  };
}
