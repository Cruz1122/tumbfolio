import type { CellType, OutputType, RenderStrategy } from "@tumbfolio/domain";

export type NotebookValidationIssue = {
  code: "INVALID_JSON" | "UNSUPPORTED_NBFORMAT" | "EMPTY_NOTEBOOK" | "NO_CELLS" | "NO_OUTPUTS";
  message: string;
};

export type NotebookAnalysisSummary = {
  nbformat: number;
  cellCount: number;
  outputCount: number;
  cellTypes: Record<CellType, number>;
  outputTypes: Record<OutputType, number>;
  detectedMimeTypes: string[];
  warnings: NotebookValidationIssue[];
};

type RawNotebook = {
  nbformat?: unknown;
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

export function normalizeNotebookSource(source: unknown): string {
  if (typeof source === "string") {
    return source;
  }

  if (Array.isArray(source)) {
    return source.map((part) => String(part)).join("");
  }

  return "";
}

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

export function selectPrimaryMimeType(data: unknown): string | undefined {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return undefined;
  }

  const record = data as Record<string, unknown>;
  const priority = [
    "text/html",
    "image/svg+xml",
    "image/png",
    "image/jpeg",
    "text/markdown",
    "text/latex",
    "text/plain"
  ];

  return priority.find((mimeType) => Object.prototype.hasOwnProperty.call(record, mimeType));
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

export function analyzeNotebookJson(rawJson: string): NotebookAnalysisSummary {
  let notebook: RawNotebook;

  try {
    notebook = JSON.parse(rawJson) as RawNotebook;
  } catch {
    throw new Error("INVALID_JSON");
  }

  if (typeof notebook.nbformat !== "number") {
    throw new Error("UNSUPPORTED_NBFORMAT");
  }

  if (!Array.isArray(notebook.cells)) {
    throw new Error("NO_CELLS");
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

  for (const cell of notebook.cells as RawCell[]) {
    const cellType = classifyCellType(cell.cell_type);
    cellTypes[cellType] += 1;

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

  const warnings: NotebookValidationIssue[] = [];
  if (notebook.cells.length === 0) {
    warnings.push({ code: "EMPTY_NOTEBOOK", message: "Notebook has no cells." });
  }
  if (outputCount === 0) {
    warnings.push({ code: "NO_OUTPUTS", message: "Notebook has no executed outputs." });
  }

  return {
    nbformat: notebook.nbformat,
    cellCount: notebook.cells.length,
    outputCount,
    cellTypes,
    outputTypes,
    detectedMimeTypes: [...mimeTypes].sort(),
    warnings
  };
}
