import type { Readable } from "node:stream";

export type StorageNamespace =
  | "notebooks"
  | "assets"
  | "exports"
  | "nbxp"
  | "thumbnails";

export type StorageBody = Buffer | Uint8Array | string | Readable;

export type StorageObjectMetadata = Record<string, string>;

export type BuildStorageKeyInput = {
  namespace: StorageNamespace;
  projectId: string;
  objectId: string;
  extension: string;
};

export type PutObjectInput = {
  key: string;
  body: StorageBody;
  contentType: string;
  metadata?: StorageObjectMetadata;
};

export type PutObjectResult = {
  key: string;
  bucket: string;
  contentType: string;
  sizeBytes?: number;
  sha256?: string;
};

export type MultipartUploadInput = PutObjectInput & {
  queueSize?: number;
  partSizeBytes?: number;
};

export type PresignedUrlInput = {
  key: string;
  expiresInSeconds?: number;
};

export type PresignedUploadUrlInput = PresignedUrlInput & {
  contentType: string;
};

export type DeleteObjectInput = {
  key: string;
};

export type GetObjectResult = {
  key: string;
  contentType: string | undefined;
  contentLength: number | undefined;
  body: Readable;
};

export type ObjectStorage = {
  putObject(input: PutObjectInput): Promise<PutObjectResult>;
  multipartUpload(input: MultipartUploadInput): Promise<PutObjectResult>;
  getObject(key: string): Promise<GetObjectResult>;
  deleteObject(input: DeleteObjectInput): Promise<void>;
  getSignedDownloadUrl(input: PresignedUrlInput): Promise<string>;
  getSignedUploadUrl(input: PresignedUploadUrlInput): Promise<string>;
};
