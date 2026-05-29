export type NotebookUploadStatus =
  | "idle"
  | "hashing"
  | "initiating"
  | "uploading"
  | "completing"
  | "uploaded"
  | "failed";

export type UploadErrorCode =
  | "NO_FILE"
  | "INVALID_EXTENSION"
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_CONTENT_TYPE"
  | "HASH_FAILED"
  | "UPLOAD_INIT_FAILED"
  | "SIGNED_UPLOAD_FAILED"
  | "UPLOAD_COMPLETE_FAILED"
  | "UNKNOWN_UPLOAD_ERROR";

export type UploadUiError = {
  code: UploadErrorCode | string;
  title: string;
  message: string;
};

export type InitiateNotebookUploadRequest = {
  original_filename: string;
  content_type: string;
  file_size_bytes: number;
  sha256: string;
};

// ADAPTED: backend returns upload_id (not project_id/source_notebook_id at init)
export type InitiateNotebookUploadResponse = {
  upload_id: string;
  storage_key: string;
  upload_url: string;
  expires_in_seconds: number;
  status: "accepted";
};

// ADAPTED: backend expects only 4 fields (forbidNonWhitelisted in ValidationPipe)
export type CompleteNotebookUploadRequest = {
  storage_key: string;
  original_filename: string;
  file_size_bytes: number;
  sha256: string;
};

// ADAPTED: backend returns validation_status/processing_status (not storage_key/status)
export type CompleteNotebookUploadResponse = {
  project_id: string;
  source_notebook_id: string;
  validation_status: string;
  processing_status: string;
};

export type NotebookUploadResult = CompleteNotebookUploadResponse & {
  sha256: string;
  original_filename: string;
  file_size_bytes: number;
  storage_key: string;
};
