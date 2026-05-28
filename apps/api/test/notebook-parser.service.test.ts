import { HttpStatus } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { ApiException } from "../src/common/errors/api.exception.js";
import { NotebookParserService } from "../src/modules/notebooks/notebook-parser.service.js";

describe("NotebookParserService", () => {
  it("rejects re-parse when notebook has dependent presentations", async () => {
    const db = {
      findSourceNotebookById: vi.fn().mockResolvedValue({
        id: "nb-1",
        projectId: "project-1",
        storageKey: "notebooks/local-user/nb-1/source.ipynb",
        validationStatus: "valid",
      }),
      countPresentationsBySourceNotebookId: vi.fn().mockResolvedValue(1),
    };

    const service = new NotebookParserService({} as never, db as never);

    const promise = service.parseNotebook("nb-1", { force: false });

    await expect(promise).rejects.toBeInstanceOf(ApiException);
    await promise.catch((error: ApiException) => {
      expect(error.errorCode).toBe("PARSE_HAS_DEPENDENT_PRESENTATIONS");
      expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
    });
  });

  it("replaces derived parse data for valid notebook without presentations", async () => {
    const tx = {
      updateSourceNotebook: vi.fn(),
      deleteOutputsBySourceNotebookId: vi.fn(),
      deleteCellsBySourceNotebookId: vi.fn(),
      deleteDerivedNotebookAssetsBySourceNotebookId: vi.fn(),
      createCell: vi
        .fn()
        .mockResolvedValueOnce({ id: "cell-1" })
        .mockResolvedValueOnce({ id: "cell-2" }),
      createOutput: vi
        .fn()
        .mockResolvedValueOnce({ id: "out-1" })
        .mockResolvedValueOnce({ id: "out-2" }),
      createAsset: vi.fn(),
    };

    const db = {
      findSourceNotebookById: vi.fn().mockResolvedValue({
        id: "nb-1",
        projectId: "project-1",
        storageKey: "notebooks/local-user/nb-1/source.ipynb",
        validationStatus: "valid",
        metadataJson: {},
      }),
      updateSourceNotebook: vi.fn().mockResolvedValue(undefined),
      countPresentationsBySourceNotebookId: vi.fn().mockResolvedValue(0),
      listDerivedNotebookAssetsBySourceNotebookId: vi.fn().mockResolvedValue([]),
      transaction: vi.fn().mockImplementation(async (callback) => callback(tx)),
    };
    const storage = {
      getObjectAsText: vi.fn().mockResolvedValue(`{
        "nbformat": 4,
        "nbformat_minor": 5,
        "cells": [
          {
            "cell_type": "markdown",
            "metadata": {},
            "source": ["# Intro\\n"]
          },
          {
            "cell_type": "code",
            "execution_count": 1,
            "metadata": {},
            "source": ["plt.plot(x, y)"],
            "outputs": [
              {
                "output_type": "display_data",
                "metadata": {},
                "data": {
                  "image/png": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Z0uoAAAAASUVORK5CYII="
                }
              }
            ]
          }
        ]
      }`),
      storeBuffer: vi.fn().mockResolvedValue({
        key: "assets/project-1/obj.png",
        sha256: "abc",
        sizeBytes: 68,
        mediaType: "image/png",
      }),
      deleteObject: vi.fn(),
    };

    const service = new NotebookParserService(storage as never, db as never);
    const result = await service.parseNotebook("nb-1", { force: false });

    expect(tx.deleteOutputsBySourceNotebookId).toHaveBeenCalledWith("nb-1");
    expect(tx.deleteCellsBySourceNotebookId).toHaveBeenCalledWith("nb-1");
    expect(tx.createCell).toHaveBeenCalledTimes(2);
    expect(tx.createOutput).toHaveBeenCalledTimes(1);
    expect(tx.createAsset).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      source_notebook_id: "nb-1",
      cell_count: 2,
      output_count: 1,
      asset_count: 1,
      processing_status: "processed",
    });
  });

  it("records cleanup warning when old storage assets cannot be deleted", async () => {
    const tx = {
      updateSourceNotebook: vi.fn(),
      deleteOutputsBySourceNotebookId: vi.fn(),
      deleteCellsBySourceNotebookId: vi.fn(),
      deleteDerivedNotebookAssetsBySourceNotebookId: vi.fn(),
      createCell: vi.fn().mockResolvedValue({ id: "cell-1" }),
      createOutput: vi.fn().mockResolvedValue({ id: "out-1" }),
      createAsset: vi.fn(),
    };

    const findSourceNotebookById = vi
      .fn()
      .mockResolvedValueOnce({
        id: "nb-1",
        projectId: "project-1",
        storageKey: "notebooks/local-user/nb-1/source.ipynb",
        validationStatus: "valid",
        metadataJson: {},
      })
      .mockResolvedValueOnce({
        id: "nb-1",
        projectId: "project-1",
        storageKey: "notebooks/local-user/nb-1/source.ipynb",
        validationStatus: "valid",
        metadataJson: {
          parser: {
            status: "processed",
          },
        },
      });

    const updateSourceNotebook = vi.fn().mockResolvedValue(undefined);

    const db = {
      findSourceNotebookById,
      updateSourceNotebook,
      countPresentationsBySourceNotebookId: vi.fn().mockResolvedValue(0),
      listDerivedNotebookAssetsBySourceNotebookId: vi.fn().mockResolvedValue([
        { storageKey: "assets/project-1/old.png" },
      ]),
      transaction: vi.fn().mockImplementation(async (callback) => callback(tx)),
    };
    const storage = {
      getObjectAsText: vi.fn().mockResolvedValue(`{
        "nbformat": 4,
        "cells": [
          {
            "cell_type": "markdown",
            "metadata": {},
            "source": ["# Intro\\n"]
          }
        ]
      }`),
      deleteObject: vi.fn().mockRejectedValue(new Error("delete failed")),
    };

    const service = new NotebookParserService(storage as never, db as never);
    await service.parseNotebook("nb-1", { force: false });

    expect(updateSourceNotebook).toHaveBeenCalledWith(
      "nb-1",
      expect.objectContaining({
        metadataJson: expect.objectContaining({
          parser: expect.objectContaining({
            cleanup: expect.objectContaining({
              status: "warning",
              failed_storage_keys: ["assets/project-1/old.png"],
            }),
          }),
        }),
      }),
    );
  });

  it("returns summarized cells and hydrates asset URLs only on demand", async () => {
    const db = {
      findSourceNotebookById: vi.fn().mockResolvedValue({
        id: "nb-1",
        projectId: "project-1",
        storageKey: "notebooks/local-user/nb-1/source.ipynb",
        validationStatus: "valid",
      }),
      listCellsBySourceNotebookId: vi.fn().mockResolvedValue([
        {
          id: "cell-1",
          cellIndex: 0,
          cellType: "code",
          source: "df.head()",
          executionCount: 4,
          classification: null,
          isNoise: false,
          metadataJson: {},
        },
      ]),
      listOutputsByNotebookCellIds: vi.fn().mockResolvedValue([
        {
          id: "out-1",
          notebookCellId: "cell-1",
          outputIndex: 0,
          outputType: "display_data",
          mimeType: "image/png",
          renderStrategy: "image",
          priority: 100,
          isNoise: false,
          dataJson: {},
        },
      ]),
      listAssetsBySourceOutputIds: vi.fn().mockResolvedValue([
        {
          id: "asset-1",
          sourceOutputId: "out-1",
          assetType: "output_image",
          mediaType: "image/png",
          filename: "plot.png",
          byteSize: 184203,
          sha256: "hash-1",
        },
      ]),
    };
    const storage = {
      getSignedDownloadUrl: vi.fn().mockResolvedValue("https://signed-url"),
    };

    const service = new NotebookParserService(storage as never, db as never);
    const withoutUrls = await service.getCells("nb-1", {
      include_outputs: true,
      include_asset_urls: false,
      preview_chars: 1000,
    });
    const withUrls = await service.getCells("nb-1", {
      include_outputs: true,
      include_asset_urls: true,
      preview_chars: 1000,
    });

    expect(withoutUrls.cells[0]?.outputs[0]?.asset?.download_url).toBeNull();
    expect(withUrls.cells[0]?.outputs[0]?.asset?.download_url).toBe(
      "https://signed-url",
    );
  });
});
