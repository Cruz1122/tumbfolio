import { selectPrimaryMimeType } from "./mime-priority.js";
import { normalizeSource } from "./normalize-source.js";

export type ParsedNotebookOutput = {
  output_index: number;
  output_type:
    | "execute_result"
    | "display_data"
    | "stream"
    | "error"
    | "unknown";
  mime_type?: string;
  data: unknown;
  text?: string;
  name?: "stdout" | "stderr";
  ename?: string;
  evalue?: string;
  traceback?: string[];
  metadata: Record<string, unknown>;
  render_strategy:
    | "plain_text"
    | "html"
    | "image"
    | "svg"
    | "stream"
    | "error"
    | "json"
    | "unsupported";
  priority: number;
  is_noise: boolean;
};

export function normalizeOutput(
  raw: unknown,
  outputIndex: number,
): ParsedNotebookOutput {
  const output = isRecord(raw) ? raw : {};
  const outputType =
    typeof output.output_type === "string" ? output.output_type : "unknown";

  if (outputType === "stream") {
    const name = output.name === "stderr" ? "stderr" : "stdout";
    const text = normalizeSource(output.text);

    return {
      output_index: outputIndex,
      output_type: "stream",
      name,
      data: text,
      metadata: {},
      render_strategy: "stream",
      priority: name === "stderr" ? 20 : 30,
      is_noise: name === "stderr",
      ...(text ? { text } : {}),
    };
  }

  if (outputType === "error") {
    const traceback = Array.isArray(output.traceback)
      ? output.traceback.map((entry) => String(entry))
      : [];

    return {
      output_index: outputIndex,
      output_type: "error",
      data: {
        ename: output.ename,
        evalue: output.evalue,
        traceback,
      },
      metadata: {},
      render_strategy: "error",
      priority: 10,
      is_noise: true,
      ...(stringify(output.ename) ? { ename: stringify(output.ename) } : {}),
      ...(stringify(output.evalue) ? { evalue: stringify(output.evalue) } : {}),
      ...(traceback.length > 0 ? { traceback } : {}),
      ...(traceback.length > 0 ? { text: traceback.join("\n") } : {}),
    };
  }

  const data = output.data;
  const mimeType = selectPrimaryMimeType(data);
  const payload = extractMimePayload(data, mimeType);
  const text = extractTextPayload(payload, mimeType);

  return {
    output_index: outputIndex,
    output_type: normalizeOutputType(outputType),
    data: payload,
    metadata: isRecord(output.metadata) ? output.metadata : {},
    render_strategy: chooseRenderStrategy(mimeType),
    priority: priorityForMime(mimeType),
    is_noise: false,
    ...(mimeType ? { mime_type: mimeType } : {}),
    ...(text ? { text } : {}),
  };
}

function normalizeOutputType(
  value: string,
): ParsedNotebookOutput["output_type"] {
  if (value === "execute_result") return "execute_result";
  if (value === "display_data") return "display_data";
  if (value === "stream") return "stream";
  if (value === "error") return "error";
  return "unknown";
}

function extractMimePayload(data: unknown, mimeType?: string): unknown {
  if (!mimeType || !isRecord(data)) {
    return data;
  }

  return data[mimeType];
}

function extractTextPayload(
  payload: unknown,
  mimeType?: string,
): string | undefined {
  if (!mimeType) {
    return undefined;
  }

  if (
    mimeType === "text/plain" ||
    mimeType === "text/html" ||
    mimeType === "text/markdown" ||
    mimeType === "text/latex" ||
    mimeType === "image/svg+xml"
  ) {
    return normalizeSource(payload);
  }

  if (mimeType === "application/json") {
    try {
      return JSON.stringify(payload, null, 2);
    } catch {
      return stringify(payload);
    }
  }

  return undefined;
}

function chooseRenderStrategy(
  mimeType?: string,
): ParsedNotebookOutput["render_strategy"] {
  if (!mimeType) return "unsupported";
  if (mimeType === "text/plain") return "plain_text";
  if (mimeType === "text/html") return "html";
  if (mimeType === "image/png" || mimeType === "image/jpeg") return "image";
  if (mimeType === "image/svg+xml") return "svg";
  if (mimeType === "application/json") return "json";
  return "unsupported";
}

function priorityForMime(mimeType?: string): number {
  switch (mimeType) {
    case "image/png":
    case "image/jpeg":
      return 100;
    case "image/svg+xml":
      return 95;
    case "text/html":
      return 80;
    case "application/json":
      return 50;
    case "text/plain":
      return 40;
    default:
      return 0;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringify(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === undefined || value === null) return "";
  return String(value);
}
