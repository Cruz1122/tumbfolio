import { normalizeOutput, type ParsedNotebookOutput } from "./normalize-output.js";
import { normalizeSource } from "./normalize-source.js";

export type ParsedNotebookCell = {
  cell_index: number;
  cell_type: "markdown" | "code" | "raw" | "unknown";
  source: string;
  metadata: Record<string, unknown>;
  execution_count?: number | null;
  outputs: ParsedNotebookOutput[];
  classification: "unclassified";
  is_noise: boolean;
};

export type ParsedNotebook = {
  nbformat: number;
  nbformat_minor?: number;
  cells: ParsedNotebookCell[];
};

export function parseNotebookJson(rawJson: string): ParsedNotebook {
  const parsed = JSON.parse(rawJson) as Record<string, unknown>;
  const rawCells = Array.isArray(parsed.cells) ? parsed.cells : [];

  return {
    nbformat: Number(parsed.nbformat),
    ...(typeof parsed.nbformat_minor === "number"
      ? { nbformat_minor: parsed.nbformat_minor }
      : {}),
    cells: rawCells.map((rawCell, index) => normalizeCell(rawCell, index)),
  };
}

function normalizeCell(raw: unknown, cellIndex: number): ParsedNotebookCell {
  const cell = isRecord(raw) ? raw : {};
  const rawOutputs = Array.isArray(cell.outputs) ? cell.outputs : [];

  return {
    cell_index: cellIndex,
    cell_type: normalizeCellType(cell.cell_type),
    source: normalizeSource(cell.source),
    metadata: isRecord(cell.metadata) ? cell.metadata : {},
    execution_count:
      typeof cell.execution_count === "number" ? cell.execution_count : null,
    outputs: rawOutputs.map((output, outputIndex) =>
      normalizeOutput(output, outputIndex),
    ),
    classification: "unclassified",
    is_noise: false,
  };
}

function normalizeCellType(
  value: unknown,
): ParsedNotebookCell["cell_type"] {
  if (value === "markdown") return "markdown";
  if (value === "code") return "code";
  if (value === "raw") return "raw";
  return "unknown";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
