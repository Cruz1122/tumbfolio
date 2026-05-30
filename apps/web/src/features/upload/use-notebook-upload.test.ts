import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("react", async () => {
  const actual = (await vi.importActual("react")) as Record<string, unknown>;
  return {
    ...actual,
    useState: vi.fn((init: unknown) => [init, vi.fn()]),
    useCallback: vi.fn((fn: unknown) => fn),
    useMemo: vi.fn((fn: () => unknown) => fn()),
  };
});

vi.mock("./notebook-upload.validation", () => ({
  validateNotebookFile: vi.fn(),
  getNotebookContentType: vi.fn(() => "application/x-ipynb+json"),
}));

vi.mock("./notebook-upload.hash", () => ({
  calculateFileSha256: vi.fn(),
}));

vi.mock("./notebook-upload.api", () => ({
  initiateNotebookUpload: vi.fn(),
  completeNotebookUpload: vi.fn(),
  uploadFileToSignedUrl: vi.fn(),
}));

import { useState } from "react";
import {
  completeNotebookUpload,
  initiateNotebookUpload,
  uploadFileToSignedUrl,
} from "./notebook-upload.api";
import { calculateFileSha256 } from "./notebook-upload.hash";
import type { NotebookUploadResult } from "./notebook-upload.types";
import { validateNotebookFile } from "./notebook-upload.validation";
import { useNotebookUpload } from "./use-notebook-upload";

const MOCK_SHA256 = "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9";

const MOCK_INITIATED = {
  upload_id: "upload-1",
  storage_key: "key/test.ipynb",
  upload_url: "https://storage.example.com/upload",
  expires_in_seconds: 3600,
  status: "accepted" as const,
};

const MOCK_COMPLETED = {
  project_id: "proj-1",
  source_notebook_id: "nb-1",
  validation_status: "valid",
  processing_status: "completed",
};

describe("useNotebookUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(validateNotebookFile).mockReturnValue(null);
    vi.mocked(calculateFileSha256).mockResolvedValue(MOCK_SHA256);
    vi.mocked(initiateNotebookUpload).mockResolvedValue(MOCK_INITIATED);
    vi.mocked(uploadFileToSignedUrl).mockResolvedValue(undefined);
    vi.mocked(completeNotebookUpload).mockResolvedValue(MOCK_COMPLETED);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calls all upload functions in order on successful upload", async () => {
    const onCompleted = vi.fn();
    const hook = useNotebookUpload({ onCompleted });
    const file = new File(["content"], "test.ipynb", {
      type: "application/json",
    });

    await hook.uploadNotebook(file);

    expect(validateNotebookFile).toHaveBeenCalledWith(file);
    expect(calculateFileSha256).toHaveBeenCalledWith(file);
    expect(initiateNotebookUpload).toHaveBeenCalledWith({
      original_filename: "test.ipynb",
      content_type: "application/x-ipynb+json",
      file_size_bytes: 7,
      sha256: MOCK_SHA256,
    });
    expect(uploadFileToSignedUrl).toHaveBeenCalledWith({
      uploadUrl: MOCK_INITIATED.upload_url,
      file,
      headers: { "Content-Type": "application/x-ipynb+json" },
      onProgress: expect.any(Function) as unknown,
    });
    expect(completeNotebookUpload).toHaveBeenCalledWith({
      storage_key: MOCK_INITIATED.storage_key,
      original_filename: "test.ipynb",
      file_size_bytes: 7,
      sha256: MOCK_SHA256,
    });

    expect(onCompleted).toHaveBeenCalledTimes(1);
    const resultArg = onCompleted.mock.calls[0]![0] as NotebookUploadResult;
    expect(resultArg.project_id).toBe(MOCK_COMPLETED.project_id);
    expect(resultArg.sha256).toBe(MOCK_SHA256);
    expect(resultArg.original_filename).toBe("test.ipynb");
  });

  it("sets status to failed when validation fails", async () => {
    const validationError = {
      code: "NO_FILE",
      title: "Sin archivo",
      message: "Selecciona un archivo",
    };
    vi.mocked(validateNotebookFile).mockReturnValue(validationError);

    const hook = useNotebookUpload({});

    // capture setError mock from useState
    const useStateMock = vi.mocked(useState);
    expect(useStateMock).toHaveBeenCalled();

    await hook.uploadNotebook(new File([], "test.ipynb"));

    // get the 4th useState setter (error setter, index 3)
    const setError = useStateMock.mock.results[3]?.value?.[1] as
      | { mock: { calls: unknown[][] } }
      | undefined;
    if (setError?.mock) {
      expect(setError.mock.calls.some(
        (call: unknown[]) => (call[0] as { code: string })?.code === "NO_FILE",
      )).toBe(true);
    }

    expect(calculateFileSha256).not.toHaveBeenCalled();
  });

  it("sets status to failed when initiateNotebookUpload throws", async () => {
    const apiError = {
      code: "UPLOAD_INIT_FAILED",
      title: "Init failed",
      message: "Could not init upload",
    };
    vi.mocked(initiateNotebookUpload).mockRejectedValue(apiError);

    const onCompleted = vi.fn();
    const hook = useNotebookUpload({ onCompleted });
    const file = new File(["content"], "test.ipynb", {
      type: "application/json",
    });

    await hook.uploadNotebook(file);

    expect(onCompleted).not.toHaveBeenCalled();
    expect(completeNotebookUpload).not.toHaveBeenCalled();
  });

  it("resetUpload resets all state to idle", () => {
    const hook = useNotebookUpload({});
    hook.resetUpload();

    const useStateMock = vi.mocked(useState);
    expect(useStateMock).toHaveBeenCalled();

    const setStatus = useStateMock.mock.results[0]?.value?.[1] as
      | { mock: { calls: unknown[][] } }
      | undefined;
    if (setStatus?.mock) {
      expect(setStatus.mock.calls.some(
        (call: unknown[]) => call[0] === "idle",
      )).toBe(true);
    }
  });

  it("returns isBusy based on status", () => {
    const hook = useNotebookUpload({});
    expect(hook.isBusy).toBe(false);
  });
});
