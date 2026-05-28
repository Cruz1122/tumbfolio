import { fileTypeFromBuffer } from "file-type";
import { UnsupportedMimeTypeError } from "./errors.js";

const MIME_TO_EXTENSION: Record<string, string> = {
  "application/x-ipynb+json": "ipynb",
  "application/json": "json",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/svg+xml": "svg",
  "text/html": "html",
  "text/plain": "txt",
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx",
  "application/vnd.tumbfolio.nbxp+zip": "nbxp",
  "application/zip": "zip",
};

export function extensionFromMimeType(mimeType: string): string {
  const extension = MIME_TO_EXTENSION[mimeType];

  if (!extension) {
    throw new UnsupportedMimeTypeError(mimeType);
  }

  return extension;
}

export async function detectMimeTypeFromBuffer(
  buffer: Buffer,
  fallbackMimeType?: string,
): Promise<string | undefined> {
  const detected = await fileTypeFromBuffer(buffer);

  if (detected?.mime) {
    return detected.mime;
  }

  if (looksLikeSvg(buffer)) {
    return "image/svg+xml";
  }

  if (looksLikeJson(buffer)) {
    return fallbackMimeType ?? "application/json";
  }

  if (looksLikeHtml(buffer)) {
    return "text/html";
  }

  return fallbackMimeType;
}

function looksLikeJson(buffer: Buffer): boolean {
  const sample = buffer.toString("utf8", 0, Math.min(buffer.length, 256)).trim();
  return sample.startsWith("{") || sample.startsWith("[");
}

function looksLikeHtml(buffer: Buffer): boolean {
  const sample = buffer.toString("utf8", 0, Math.min(buffer.length, 512)).trim();
  return /^<!doctype html|^<html[\s>]/i.test(sample);
}

function looksLikeSvg(buffer: Buffer): boolean {
  const sample = buffer.toString("utf8", 0, Math.min(buffer.length, 512)).trim();
  return sample.startsWith("<svg") || sample.includes("<svg");
}
