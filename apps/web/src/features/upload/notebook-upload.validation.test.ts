import { describe, expect, it } from "vitest";
import { NOTEBOOK_CONTENT_TYPE } from "./notebook-upload.constants";
import {
  formatBytes,
  getNotebookContentType,
  validateNotebookFile,
} from "./notebook-upload.validation";

function createMockFile(
  name: string,
  size: number,
  type: string = "",
): File {
  const file = new File(["content"], name, { type });
  if (size !== 7) {
    Object.defineProperty(file, "size", { value: size, writable: false });
  }
  return file;
}

describe("validateNotebookFile", () => {
  it("returns NO_FILE error when file is null", () => {
    const result = validateNotebookFile(null);
    expect(result).not.toBeNull();
    expect(result!.code).toBe("NO_FILE");
  });

  it("returns NO_FILE error when file is undefined", () => {
    const result = validateNotebookFile(undefined);
    expect(result).not.toBeNull();
    expect(result!.code).toBe("NO_FILE");
  });

  it("returns INVALID_EXTENSION for .txt file", () => {
    const file = createMockFile("test.txt", 1000, "text/plain");
    const result = validateNotebookFile(file);
    expect(result).not.toBeNull();
    expect(result!.code).toBe("INVALID_EXTENSION");
  });

  it("returns INVALID_EXTENSION for .csv file", () => {
    const file = createMockFile("test.csv", 1000, "text/csv");
    const result = validateNotebookFile(file);
    expect(result).not.toBeNull();
    expect(result!.code).toBe("INVALID_EXTENSION");
  });

  it("returns NO_FILE for empty .ipynb (size 0)", () => {
    const file = createMockFile("test.ipynb", 0);
    const result = validateNotebookFile(file);
    expect(result).not.toBeNull();
    expect(result!.code).toBe("NO_FILE");
  });

  it("returns FILE_TOO_LARGE when size exceeds 25MB", () => {
    const file = createMockFile("test.ipynb", 30 * 1024 * 1024);
    const result = validateNotebookFile(file);
    expect(result).not.toBeNull();
    expect(result!.code).toBe("FILE_TOO_LARGE");
  });

  it("returns UNSUPPORTED_CONTENT_TYPE for video/mp4", () => {
    const file = createMockFile("test.ipynb", 1000, "video/mp4");
    const result = validateNotebookFile(file);
    expect(result).not.toBeNull();
    expect(result!.code).toBe("UNSUPPORTED_CONTENT_TYPE");
  });

  it("returns null for valid ipynb with empty type", () => {
    const file = createMockFile("test.ipynb", 1000, "");
    const result = validateNotebookFile(file);
    expect(result).toBeNull();
  });

  it("returns null for valid ipynb with application/json", () => {
    const file = createMockFile("test.ipynb", 1000, "application/json");
    const result = validateNotebookFile(file);
    expect(result).toBeNull();
  });

  it("returns null for valid ipynb with application/octet-stream", () => {
    const file = createMockFile("test.ipynb", 1000, "application/octet-stream");
    const result = validateNotebookFile(file);
    expect(result).toBeNull();
  });

  it("returns null for uppercase extension (case insensitive)", () => {
    const file = createMockFile("TEST.IPYNB", 1000, "");
    const result = validateNotebookFile(file);
    expect(result).toBeNull();
  });
});

describe("getNotebookContentType", () => {
  it("returns NOTEBOOK_CONTENT_TYPE for empty type", () => {
    const file = createMockFile("test.ipynb", 1000, "");
    expect(getNotebookContentType(file)).toBe(NOTEBOOK_CONTENT_TYPE);
  });

  it("returns NOTEBOOK_CONTENT_TYPE for application/json", () => {
    const file = createMockFile("test.ipynb", 1000, "application/json");
    expect(getNotebookContentType(file)).toBe(NOTEBOOK_CONTENT_TYPE);
  });

  it("returns NOTEBOOK_CONTENT_TYPE for application/octet-stream", () => {
    const file = createMockFile("test.ipynb", 1000, "application/octet-stream");
    expect(getNotebookContentType(file)).toBe(NOTEBOOK_CONTENT_TYPE);
  });

  it("returns original type for text/html", () => {
    const file = createMockFile("test.ipynb", 1000, "text/html");
    expect(getNotebookContentType(file)).toBe("text/html");
  });
});

describe("formatBytes", () => {
  it("formats 1024 bytes as 0.0 MB", () => {
    expect(formatBytes(1024)).toBe("0.0 MB");
  });

  it("formats 10 MB as 10 MB", () => {
    expect(formatBytes(10 * 1024 * 1024)).toBe("10 MB");
  });

  it("formats 15.5 MB as 16 MB (rounding with toFixed(0))", () => {
    expect(formatBytes(15.5 * 1024 * 1024)).toBe("16 MB");
  });
});
