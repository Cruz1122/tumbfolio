import { describe, expect, it, vi } from "vitest";
import { NotebookValidationService } from "../src/modules/notebooks/notebook-validation.service.js";

describe("NotebookValidationService", () => {
  it("reads notebook from storage, validates it and persists summary", async () => {
    const notebookRow = {
      id: "notebook-1",
      projectId: "project-1",
      originalFilename: "analysis.ipynb",
      storageKey: "notebooks/local-user/upload-1/source.ipynb",
      processingStatus: "idle",
      validationStatus: "pending",
      cellCount: 0,
      outputCount: 0,
      detectedMimeTypes: [],
      validationErrors: [],
      validationWarnings: [],
      metadataJson: {},
    };
    const updateSourceNotebook = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        ...notebookRow,
        validationStatus: "valid",
        cellCount: 1,
        outputCount: 0,
        validationWarnings: [
          {
            code: "NO_OUTPUTS",
            message:
              "Notebook has no executed outputs, but markdown content is available.",
          },
        ],
      });

    const db = {
      findSourceNotebookById: vi.fn().mockResolvedValue(notebookRow),
      updateSourceNotebook,
    };
    const storage = {
      getObjectAsText: vi.fn().mockResolvedValue(`{
        "nbformat": 4,
        "nbformat_minor": 5,
        "cells": [
          {
            "cell_type": "markdown",
            "metadata": {},
            "source": ["# Title\\n"]
          }
        ]
      }`),
    };

    const service = new NotebookValidationService(storage as never, db as never);
    const result = await service.validateNotebook("notebook-1");

    expect(storage.getObjectAsText).toHaveBeenCalledWith(
      "notebooks/local-user/upload-1/source.ipynb",
    );
    expect(updateSourceNotebook).toHaveBeenNthCalledWith(1, "notebook-1", {
      validationStatus: "validating",
    });
    expect(updateSourceNotebook).toHaveBeenNthCalledWith(
      2,
      "notebook-1",
      expect.objectContaining({
        nbformat: 4,
        nbformatMinor: 5,
        validationStatus: "valid",
        cellCount: 1,
        outputCount: 0,
        detectedMimeTypes: [],
      }),
    );
    expect(result.validation_status).toBe("valid");
    expect(result.validation_warnings).toEqual([
      {
        code: "NO_OUTPUTS",
        message:
          "Notebook has no executed outputs, but markdown content is available.",
      },
    ]);
  });

  it("returns persisted summary for existing notebook", async () => {
    const db = {
      findSourceNotebookById: vi.fn().mockResolvedValue({
        id: "notebook-1",
        projectId: "project-1",
        originalFilename: "analysis.ipynb",
        storageKey: "notebooks/local-user/upload-1/source.ipynb",
        processingStatus: "idle",
        validationStatus: "invalid",
        cellCount: 0,
        outputCount: 0,
        detectedMimeTypes: [],
        validationErrors: [{ code: "INVALID_JSON", message: "bad" }],
        validationWarnings: [],
        metadataJson: {},
      }),
    };

    const service = new NotebookValidationService({} as never, db as never);
    const result = await service.getSummary("notebook-1");

    expect(result).toMatchObject({
      id: "notebook-1",
      project_id: "project-1",
      validation_status: "invalid",
      validation_errors: [{ code: "INVALID_JSON", message: "bad" }],
    });
  });
});
