export class StorageError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "StorageError";
  }
}

export class InvalidStorageKeyError extends StorageError {
  constructor(key: string) {
    super(`Invalid storage key: ${key}`, "INVALID_STORAGE_KEY");
  }
}

export class UnsupportedMimeTypeError extends StorageError {
  constructor(mimeType: string) {
    super(`Unsupported MIME type: ${mimeType}`, "UNSUPPORTED_MIME_TYPE");
  }
}
