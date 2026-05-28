import type { StorageNamespace } from "./types.js";

export const STORAGE_NAMESPACES: readonly StorageNamespace[] = [
  "notebooks",
  "assets",
  "exports",
  "nbxp",
  "thumbnails",
] as const;

export const DEFAULT_SIGNED_URL_TTL_SECONDS = 60 * 10;

export const DEFAULT_MULTIPART_PART_SIZE_BYTES = 8 * 1024 * 1024;

export const DEFAULT_MULTIPART_QUEUE_SIZE = 4;
