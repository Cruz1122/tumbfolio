const MIME_PRIORITY = [
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "text/html",
  "text/markdown",
  "text/latex",
  "application/json",
  "text/plain",
] as const;

export function selectPrimaryMimeType(data: unknown): string | undefined {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return undefined;
  }

  const record = data as Record<string, unknown>;

  for (const mime of MIME_PRIORITY) {
    if (record[mime] !== undefined) {
      return mime;
    }
  }

  return Object.keys(record)[0];
}
