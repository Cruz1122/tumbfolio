import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { calculateFileSha256 } from "./notebook-upload.hash";

describe("calculateFileSha256", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns expected SHA-256 hash for known content", async () => {
    const file = new File(["hello world"], "test.ipynb");
    const hash = await calculateFileSha256(file);
    expect(hash).toBe(
      "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
    );
  });

  it("throws when crypto.subtle is null", async () => {
    const _originalSubtle = globalThis.crypto?.subtle;
    // Override subtle to null - use Object.defineProperty since subtle is read-only
    const originalCrypto = globalThis.crypto;
    if (originalCrypto) {
      Object.defineProperty(globalThis, "crypto", {
        value: { ...originalCrypto, subtle: null },
        writable: true,
        configurable: true,
      });
    }

    const file = new File(["content"], "test.ipynb");
    await expect(calculateFileSha256(file)).rejects.toThrow(
      "Web Crypto API",
    );

    // Restore
    Object.defineProperty(globalThis, "crypto", {
      value: originalCrypto,
      writable: true,
      configurable: true,
    });
  });

  it("throws when crypto itself is undefined", async () => {
    const originalCrypto = globalThis.crypto;
    Object.defineProperty(globalThis, "crypto", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const file = new File(["content"], "test.ipynb");
    await expect(calculateFileSha256(file)).rejects.toThrow(
      "Web Crypto API",
    );

    Object.defineProperty(globalThis, "crypto", {
      value: originalCrypto,
      writable: true,
      configurable: true,
    });
  });
});
