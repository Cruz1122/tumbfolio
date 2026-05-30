import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  completeNotebookUpload,
  initiateNotebookUpload,
  uploadFileToSignedUrl,
} from "./notebook-upload.api";
import type { UploadUiError } from "./notebook-upload.types";

let mockXhrInstance: MockXHR;

class MockXHR {
  open = vi.fn();
  setRequestHeader = vi.fn();
  send = vi.fn();
  upload: { onprogress: ((e: ProgressEvent) => void) | null } = {
    onprogress: null,
  };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  status = 200;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    mockXhrInstance = this;
  }
}

describe("initiateNotebookUpload", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls fetch with correct URL and body, returns parsed response", async () => {
    const mockResponse = {
      upload_id: "upload-123",
      storage_key: "key/notebook.ipynb",
      upload_url: "https://storage.example.com/upload",
      expires_in_seconds: 3600,
      status: "accepted" as const,
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
      status: 200,
    } as Response);

    const input = {
      original_filename: "test.ipynb",
      content_type: "application/x-ipynb+json",
      file_size_bytes: 1024,
      sha256: "abc123def",
    };

    const result = await initiateNotebookUpload(input);

    expect(fetch).toHaveBeenCalledTimes(1);
    const fetchCall = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect(fetchCall[0]).toContain("/notebooks/uploads/initiate");
    expect(fetchCall[1].method).toBe("POST");
    expect(fetchCall[1].headers).toEqual({
      "Content-Type": "application/json",
    });
    expect(JSON.parse(fetchCall[1].body as string)).toEqual(input);
    expect(result).toEqual(mockResponse);
  });

  it("throws UploadUiError with UPLOAD_INIT_FAILED when upload_id is missing", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ status: "accepted" })),
      status: 200,
    } as Response);

    await expect(
      initiateNotebookUpload({
        original_filename: "test.ipynb",
        content_type: "application/x-ipynb+json",
        file_size_bytes: 1024,
        sha256: "abc",
      }),
    ).rejects.toMatchObject({
      code: "UPLOAD_INIT_FAILED",
    });
  });

  it("throws UploadUiError with FILE_TOO_LARGE when server returns 400 with error_code", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            error_code: "FILE_TOO_LARGE",
            message: "File too large",
          }),
        ),
    } as Response);

    await expect(
      initiateNotebookUpload({
        original_filename: "test.ipynb",
        content_type: "application/x-ipynb+json",
        file_size_bytes: 30 * 1024 * 1024,
        sha256: "abc",
      }),
    ).rejects.toMatchObject({
      code: "FILE_TOO_LARGE",
    });
  });

  it("throws UploadUiError with API_REQUEST_FAILED when server returns 500", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve(""),
    } as Response);

    await expect(
      initiateNotebookUpload({
        original_filename: "test.ipynb",
        content_type: "application/x-ipynb+json",
        file_size_bytes: 1024,
        sha256: "abc",
      }),
    ).rejects.toMatchObject({
      code: "API_REQUEST_FAILED",
    });
  });

  it("throws UploadUiError with API_UNAVAILABLE when fetch rejects", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("fetch failed"));

    await expect(
      initiateNotebookUpload({
        original_filename: "test.ipynb",
        content_type: "application/x-ipynb+json",
        file_size_bytes: 1024,
        sha256: "abc",
      }),
    ).rejects.toMatchObject({
      code: "API_UNAVAILABLE",
    });
  });
});

describe("completeNotebookUpload", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls fetch with correct URL and body, returns parsed response", async () => {
    const mockResponse = {
      project_id: "proj-1",
      source_notebook_id: "nb-1",
      validation_status: "valid",
      processing_status: "completed",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
      status: 200,
    } as Response);

    const input = {
      storage_key: "key/notebook.ipynb",
      original_filename: "test.ipynb",
      file_size_bytes: 1024,
      sha256: "abc123",
    };

    const result = await completeNotebookUpload(input);

    expect(fetch).toHaveBeenCalledTimes(1);
    const fetchCall = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect(fetchCall[0]).toContain("/notebooks/uploads/complete");
    expect(fetchCall[1].method).toBe("POST");
    const sentBody = JSON.parse(fetchCall[1].body as string);
    expect(sentBody).toEqual(input);
    // Only 4 fields
    expect(Object.keys(sentBody)).toHaveLength(4);
    expect(result).toEqual(mockResponse);
  });

  it("throws UploadUiError when server returns 400", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve(JSON.stringify({ message: "Bad request" })),
    } as Response);

    await expect(
      completeNotebookUpload({
        storage_key: "key/nb.ipynb",
        original_filename: "test.ipynb",
        file_size_bytes: 1024,
        sha256: "abc",
      }),
    ).rejects.toMatchObject({
      title: "La solicitud falló",
    } satisfies Partial<UploadUiError>);
  });
});

describe("uploadFileToSignedUrl", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockXhrInstance = null as unknown as MockXHR;
    vi.stubGlobal("XMLHttpRequest", MockXHR);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("resolves and calls onProgress on successful upload", async () => {
    const onProgress = vi.fn();

    const uploadPromise = uploadFileToSignedUrl({
      uploadUrl: "https://storage.example.com/upload",
      file: new File(["content"], "test.ipynb"),
      onProgress,
    });

    // Simulate progress
    const progressEvent = { lengthComputable: true, loaded: 50, total: 100 };
    mockXhrInstance.upload.onprogress!(progressEvent as unknown as ProgressEvent);

    // Simulate success
    mockXhrInstance.status = 200;
    mockXhrInstance.onload!();

    await expect(uploadPromise).resolves.toBeUndefined();
    expect(onProgress).toHaveBeenCalledWith(50);
    expect(onProgress).toHaveBeenCalledWith(100);
  });

  it("rejects with SIGNED_UPLOAD_FAILED on server error (403)", async () => {
    const uploadPromise = uploadFileToSignedUrl({
      uploadUrl: "https://storage.example.com/upload",
      file: new File(["content"], "test.ipynb"),
    });

    mockXhrInstance.status = 403;
    mockXhrInstance.onload!();

    await expect(uploadPromise).rejects.toMatchObject({
      code: "SIGNED_UPLOAD_FAILED",
    });
  });

  it("rejects with SIGNED_UPLOAD_FAILED on network error", async () => {
    const uploadPromise = uploadFileToSignedUrl({
      uploadUrl: "https://storage.example.com/upload",
      file: new File(["content"], "test.ipynb"),
    });

    mockXhrInstance.onerror!();

    await expect(uploadPromise).rejects.toMatchObject({
      code: "SIGNED_UPLOAD_FAILED",
    });
  });

  it("sets request headers when provided", () => {
    uploadFileToSignedUrl({
      uploadUrl: "https://storage.example.com/upload",
      file: new File(["content"], "test.ipynb"),
      headers: { "Content-Type": "application/x-ipynb+json" },
    });

    expect(mockXhrInstance.setRequestHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/x-ipynb+json",
    );
  });
});
