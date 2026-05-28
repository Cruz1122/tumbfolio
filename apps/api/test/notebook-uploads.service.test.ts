import { HttpStatus } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { ApiException } from "../src/common/errors/api.exception.js";
import { NotebookUploadsService } from "../src/modules/notebooks/notebook-uploads.service.js";

describe("NotebookUploadsService", () => {
  it("returns signed upload URL with notebook metadata", async () => {
    const storage = {
      createSignedUploadUrl: vi.fn().mockResolvedValue("https://signed-upload"),
    };
    const db = {
      transaction: vi.fn(),
    };

    const service = new NotebookUploadsService(storage as never, db as never);

    const result = await service.initiateUpload({
      original_filename: "analysis.ipynb",
      content_type: "application/x-ipynb+json",
      file_size_bytes: 1024,
      sha256: "a".repeat(64),
    });

    expect(result).toMatchObject({
      storage_key: expect.stringMatching(
        /^notebooks\/local-user\/.+\/source\.ipynb$/,
      ),
      upload_url: "https://signed-upload",
      expires_in_seconds: 900,
      status: "accepted",
    });
    expect(storage.createSignedUploadUrl).toHaveBeenCalledWith({
      key: result.storage_key,
      contentType: "application/x-ipynb+json",
      expiresInSeconds: 900,
      metadata: {
        original_filename: "analysis.ipynb",
        sha256: "a".repeat(64),
      },
    });
  });

  it("rejects oversized notebooks before signing upload", async () => {
    const storage = {
      createSignedUploadUrl: vi.fn(),
    };
    const db = {
      transaction: vi.fn(),
    };

    const service = new NotebookUploadsService(storage as never, db as never);

    const promise = service.initiateUpload({
      original_filename: "analysis.ipynb",
      content_type: "application/x-ipynb+json",
      file_size_bytes: 60 * 1024 * 1024,
      sha256: "a".repeat(64),
    });

    await expect(promise).rejects.toBeInstanceOf(ApiException);
    await expect(promise).rejects.toMatchObject({
      errorCode: "FILE_TOO_LARGE",
    });
    await promise.catch((error: ApiException) => {
      expect(error.getStatus()).toBe(HttpStatus.PAYLOAD_TOO_LARGE);
    });
    expect(storage.createSignedUploadUrl).not.toHaveBeenCalled();
  });

  it("creates project and source notebook only after storage object exists", async () => {
    const createProject = vi.fn().mockResolvedValue({ id: "project-1" });
    const createSourceNotebook = vi.fn().mockResolvedValue({
      id: "notebook-1",
      validationStatus: "pending",
      processingStatus: "idle",
    });
    const transaction = vi.fn().mockImplementation(async (callback) =>
      callback({
        findLocalUser: vi.fn().mockResolvedValue({ id: "user-1" }),
        createUser: vi.fn(),
        createProject,
        createSourceNotebook,
      }),
    );

    const storage = {
      headObject: vi.fn().mockResolvedValue({
        size: 1024,
        metadata: { sha256: "b".repeat(64) },
      }),
    };
    const db = { transaction };

    const service = new NotebookUploadsService(storage as never, db as never);

    const result = await service.completeUpload({
      storage_key: "notebooks/local-user/upload-1/source.ipynb",
      original_filename: "analysis.ipynb",
      file_size_bytes: 1024,
      sha256: "b".repeat(64),
    });

    expect(storage.headObject).toHaveBeenCalledWith(
      "notebooks/local-user/upload-1/source.ipynb",
    );
    expect(createProject).toHaveBeenCalledWith({
      userId: "user-1",
      name: "analysis",
      status: "active",
    });
    expect(createSourceNotebook).toHaveBeenCalledWith({
      projectId: "project-1",
      filename: "analysis.ipynb",
      storageKey: "notebooks/local-user/upload-1/source.ipynb",
      validationStatus: "pending",
      processingStatus: "idle",
      fileSizeBytes: 1024,
      sha256: "b".repeat(64),
      metadataJson: expect.objectContaining({
        original_filename: "analysis.ipynb",
        file_size_bytes: 1024,
        sha256: "b".repeat(64),
      }),
    });
    expect(result).toEqual({
      project_id: "project-1",
      source_notebook_id: "notebook-1",
      validation_status: "pending",
      processing_status: "idle",
    });
  });

  it("rejects completion when storage object is missing", async () => {
    const storage = {
      headObject: vi.fn().mockResolvedValue(null),
    };
    const db = {
      transaction: vi.fn(),
    };

    const service = new NotebookUploadsService(storage as never, db as never);

    const promise = service.completeUpload({
      storage_key: "notebooks/local-user/upload-1/source.ipynb",
      original_filename: "analysis.ipynb",
      file_size_bytes: 1024,
      sha256: "c".repeat(64),
    });

    await expect(promise).rejects.toBeInstanceOf(ApiException);
    await expect(promise).rejects.toMatchObject({
      errorCode: "NOT_FOUND",
    });
    await promise.catch((error: ApiException) => {
      expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
    });
    expect(db.transaction).not.toHaveBeenCalled();
  });
});
