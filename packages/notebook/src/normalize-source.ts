export function normalizeSource(source: unknown): string {
  if (typeof source === "string") {
    return source;
  }

  if (Array.isArray(source)) {
    return source.map((part) => String(part)).join("");
  }

  return "";
}
