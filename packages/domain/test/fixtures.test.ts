import { describe, it, expect } from "vitest";
import { SourceNotebookSchema, NotebookCellSchema, NormalizedOutputSchema, NotebookAnalysisSummarySchema } from "../src/notebook";
import { PresentationDocumentSchema } from "../src/presentation-model";
import { AssetSchema } from "../src/assets";
import { ThemeSchema } from "../src/themes";
import { ExportJobSchema } from "../src/exports";
import { AiSuggestionSchema } from "../src/ai";

import {
  sourceNotebookFixture,
  notebookCellFixtures,
  normalizedOutputFixtures,
  notebookAnalysisSummaryFixture
} from "../src/fixtures/normalized-notebook.fixture";
import { presentationDocumentFixture } from "../src/fixtures/presentation-document.fixture";
import { assetFixture } from "../src/fixtures/assets.fixture";
import { themeFixture } from "../src/fixtures/themes.fixture";
import { exportJobFixture, pendingExportJobFixture, failedExportJobFixture } from "../src/fixtures/export-jobs.fixture";
import { pendingAiSuggestionFixture, acceptedAiSuggestionFixture } from "../src/fixtures/ai-suggestions.fixture";

describe("Fixtures: notebook", () => {
  it("sourceNotebookFixture parses correctly", () => {
    const result = SourceNotebookSchema.parse(sourceNotebookFixture);
    expect(result.validationStatus).toBe("valid");
  });

  it("notebookCellFixtures all parse correctly", () => {
    for (const cell of notebookCellFixtures) {
      const result = NotebookCellSchema.parse(cell);
      expect(result.id).toBeDefined();
    }
  });

  it("normalizedOutputFixtures all parse correctly", () => {
    for (const output of normalizedOutputFixtures) {
      const result = NormalizedOutputSchema.parse(output);
      expect(result.id).toBeDefined();
    }
  });

  it("notebookAnalysisSummaryFixture parses correctly", () => {
    const result = NotebookAnalysisSummarySchema.parse(notebookAnalysisSummaryFixture);
    expect(result.validationStatus).toBe("valid");
    expect(result.cellCount).toBe(2);
  });
});

describe("Fixtures: presentation", () => {
  it("presentationDocumentFixture parses correctly", () => {
    const result = PresentationDocumentSchema.parse(presentationDocumentFixture);
    expect(result.slides).toHaveLength(3);
    expect(result.blocks).toHaveLength(3);
  });

  it("assetFixture parses correctly", () => {
    const result = AssetSchema.parse(assetFixture);
    expect(result.assetType).toBe("output_image");
  });

  it("themeFixture parses correctly", () => {
    const result = ThemeSchema.parse(themeFixture);
    expect(result.slug).toBe("colab-clean");
  });
});

describe("Fixtures: exports", () => {
  it("exportJobFixture parses correctly", () => {
    const result = ExportJobSchema.parse(exportJobFixture);
    expect(result.status).toBe("completed");
  });

  it("pendingExportJobFixture parses correctly", () => {
    const result = ExportJobSchema.parse(pendingExportJobFixture);
    expect(result.status).toBe("queued");
  });

  it("failedExportJobFixture parses correctly", () => {
    const result = ExportJobSchema.parse(failedExportJobFixture);
    expect(result.status).toBe("failed");
  });
});

describe("Fixtures: AI", () => {
  it("pendingAiSuggestionFixture parses correctly", () => {
    const result = AiSuggestionSchema.parse(pendingAiSuggestionFixture);
    expect(result.status).toBe("pending");
  });

  it("acceptedAiSuggestionFixture parses correctly", () => {
    const result = AiSuggestionSchema.parse(acceptedAiSuggestionFixture);
    expect(result.status).toBe("accepted");
  });
});
