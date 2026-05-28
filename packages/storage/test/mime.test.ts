import { describe, expect, it } from "vitest";
import {
  detectMimeTypeFromBuffer,
  extensionFromMimeType,
} from "../src/mime.js";

describe("mime helpers", () => {
  describe("extensionFromMimeType", () => {
    it("maps supported MIME types to extensions", () => {
      expect(extensionFromMimeType("image/png")).toBe("png");
      expect(extensionFromMimeType("application/pdf")).toBe("pdf");
      expect(extensionFromMimeType("application/json")).toBe("json");
      expect(extensionFromMimeType("text/html")).toBe("html");
      expect(extensionFromMimeType("image/svg+xml")).toBe("svg");
      expect(extensionFromMimeType("application/x-ipynb+json")).toBe("ipynb");
    });

    it("throws for unsupported MIME types", () => {
      expect(() => extensionFromMimeType("video/mp4")).toThrow();
      expect(() => extensionFromMimeType("")).toThrow();
    });
  });

  describe("detectMimeTypeFromBuffer", () => {
    it("detects JSON-ish buffers with fallback", async () => {
      await expect(
        detectMimeTypeFromBuffer(
          Buffer.from('{"nbformat":4}'),
          "application/x-ipynb+json",
        ),
      ).resolves.toBe("application/x-ipynb+json");
    });

    it("detects JSON with default fallback", async () => {
      await expect(
        detectMimeTypeFromBuffer(Buffer.from('{"key":"value"}')),
      ).resolves.toBe("application/json");
    });

    it("detects SVG-ish buffers", async () => {
      await expect(
        detectMimeTypeFromBuffer(Buffer.from("<svg></svg>")),
      ).resolves.toBe("image/svg+xml");
    });

    it("detects SVG with namespace", async () => {
      await expect(
        detectMimeTypeFromBuffer(
          Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
        ),
      ).resolves.toBe("image/svg+xml");
    });

    it("detects HTML buffers", async () => {
      await expect(
        detectMimeTypeFromBuffer(
          Buffer.from("<!doctype html><html><body></body></html>"),
        ),
      ).resolves.toBe("text/html");
    });

    it("returns undefined for unknown binary buffers", async () => {
      await expect(
        detectMimeTypeFromBuffer(Buffer.from([0x00, 0x01, 0x02, 0x03])),
      ).resolves.toBeUndefined();
    });

    it("returns fallback for unknown content when provided", async () => {
      await expect(
        detectMimeTypeFromBuffer(
          Buffer.from([0x00, 0x01, 0x02, 0x03]),
          "application/octet-stream",
        ),
      ).resolves.toBe("application/octet-stream");
    });
  });
});
