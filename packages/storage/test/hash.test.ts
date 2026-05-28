import { describe, expect, it } from "vitest";
import { sha256Buffer } from "../src/hash.js";

describe("sha256Buffer", () => {
  it("returns deterministic sha256 hash", () => {
    expect(sha256Buffer("tumbfolio")).toBe(
      "a5b98106f2b88598600728c1a9f7a6caa1cd47e6083181a78bfabe476df21142",
    );
  });

  it("handles empty buffer", () => {
    expect(sha256Buffer("")).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });
});
