import { describe, expect, it } from "vitest";
import { normalizeNotebookSource } from "@/lib/notebook";
import { architectureSummary, PRESENTATION_MODEL_VERSION } from "@/lib/presentation";


describe("T-01 scaffold", () => {
  it("normalizes notebook source arrays without React dependency", () => {
    expect(normalizeNotebookSource(["a", "b"])).toBe("ab");
  });

  it("defines Presentation Model version and architecture summary", () => {
    expect(PRESENTATION_MODEL_VERSION).toBe("0.1.0");
    expect(architectureSummary.canonicalFormat).toBe("HTML");
  });
});
