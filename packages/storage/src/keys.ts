import { InvalidStorageKeyError } from "./errors.js";
import type { BuildStorageKeyInput } from "./types.js";

const SAFE_EXTENSION_REGEX = /^[a-z0-9]+$/i;
const UUIDISH_REGEX = /^[a-zA-Z0-9_-]+$/;

export function normalizeExtension(extension: string): string {
  const clean = extension.replace(/^\./, "").toLowerCase();

  if (!SAFE_EXTENSION_REGEX.test(clean)) {
    throw new InvalidStorageKeyError(extension);
  }

  return clean;
}

export function assertSafeKeySegment(segment: string): void {
  if (!segment || segment.includes("/") || segment.includes("..")) {
    throw new InvalidStorageKeyError(segment);
  }

  if (!UUIDISH_REGEX.test(segment)) {
    throw new InvalidStorageKeyError(segment);
  }
}

export function buildStorageKey(input: BuildStorageKeyInput): string {
  assertSafeKeySegment(input.projectId);
  assertSafeKeySegment(input.objectId);

  const extension = normalizeExtension(input.extension);

  return `${input.namespace}/${input.projectId}/${input.objectId}.${extension}`;
}

export function assertStorageKey(key: string): void {
  if (
    key.startsWith("/") ||
    key.includes("..") ||
    key.includes("//") ||
    key.trim() !== key
  ) {
    throw new InvalidStorageKeyError(key);
  }
}
