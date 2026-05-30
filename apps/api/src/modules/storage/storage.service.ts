import { HttpStatus, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Readable } from "node:stream";
import {
  buildStorageKey,
  detectMimeTypeFromBuffer,
  extensionFromMimeType,
  S3ObjectStorage,
  sha256Buffer,
  type HeadObjectResult,
  type ObjectStorage,
  type StorageNamespace,
} from "@tumbfolio/storage";
import { loadApiEnv } from "@tumbfolio/config";
import { ApiErrorCode } from "../../common/errors/api-error-code.js";
import { ApiException } from "../../common/errors/api.exception.js";

export type StoreBufferInput = {
  namespace: StorageNamespace;
  projectId: string;
  objectId: string;
  buffer: Buffer;
  fallbackMimeType: string;
  metadata?: Record<string, string>;
};

export type StoreBufferResult = {
  key: string;
  sha256: string;
  sizeBytes: number;
  mediaType: string;
};

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly storage: ObjectStorage;
  private readonly logger = new Logger(StorageService.name);

  constructor() {
    const env = loadApiEnv();

    this.storage = new S3ObjectStorage({
      bucket: env.S3_BUCKET,
      clientConfig: {
        region: env.S3_REGION,
        ...(env.S3_ENDPOINT ? { endpoint: env.S3_ENDPOINT } : {}),
        forcePathStyle: env.S3_FORCE_PATH_STYLE,
        ...(env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY
          ? {
              credentials: {
                accessKeyId: env.S3_ACCESS_KEY_ID,
                secretAccessKey: env.S3_SECRET_ACCESS_KEY,
              },
            }
          : {}),
      },
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.storage.ensureBucketExists();
      this.logger.log("Storage bucket is ready");
      await this.storage.setBucketCors(["http://localhost:3000"]);
      this.logger.log("Bucket CORS configured for http://localhost:3000");
    } catch (error) {
      this.logger.warn("Could not initialize storage bucket:", (error as Error).message);
    }
  }

  async storeBuffer(input: StoreBufferInput): Promise<StoreBufferResult> {
    const mediaType =
      (await detectMimeTypeFromBuffer(input.buffer, input.fallbackMimeType)) ??
      input.fallbackMimeType;

    const extension = extensionFromMimeType(mediaType);
    const sha256 = sha256Buffer(input.buffer);

    const key = buildStorageKey({
      namespace: input.namespace,
      projectId: input.projectId,
      objectId: input.objectId,
      extension,
    });

    await this.storage.putObject({
      key,
      body: input.buffer,
      contentType: mediaType,
      metadata: {
        sha256,
        ...input.metadata,
      },
    });

    return {
      key,
      sha256,
      sizeBytes: input.buffer.byteLength,
      mediaType,
    };
  }

  getSignedDownloadUrl(key: string): Promise<string> {
    return this.storage.getSignedDownloadUrl({ key });
  }

  getSignedUploadUrl(input: {
    key: string;
    contentType: string;
    metadata?: Record<string, string>;
  }): Promise<string> {
    return this.storage.getSignedUploadUrl({
      key: input.key,
      contentType: input.contentType,
      ...(input.metadata ? { metadata: input.metadata } : {}),
    });
  }

  deleteObject(key: string): Promise<void> {
    return this.storage.deleteObject({ key });
  }

  getObject(key: string) {
    return this.storage.getObject(key);
  }

  async headObject(key: string): Promise<HeadObjectResult | null> {
    try {
      return await this.storage.headObject(key);
    } catch (error) {
      throw this.toStorageException(error);
    }
  }

  async getObjectAsText(key: string): Promise<string> {
    const result = await this.storage.getObject(key);
    const chunks: Buffer[] = [];

    for await (const chunk of result.body as Readable) {
      chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks).toString("utf8");
  }

  async createSignedUploadUrl(input: {
    key: string;
    contentType: string;
    expiresInSeconds?: number;
    metadata?: Record<string, string>;
  }): Promise<string> {
    try {
      return await this.storage.getSignedUploadUrl({
        key: input.key,
        contentType: input.contentType,
        ...(input.expiresInSeconds !== undefined
          ? { expiresInSeconds: input.expiresInSeconds }
          : {}),
        ...(input.metadata ? { metadata: input.metadata } : {}),
      });
    } catch (error) {
      throw this.toStorageException(error);
    }
  }

  private toStorageException(error: unknown): ApiException {
    if (error instanceof ApiException) {
      return error;
    }

    return new ApiException(
      ApiErrorCode.STORAGE_UNAVAILABLE,
      "Storage is unavailable.",
      HttpStatus.SERVICE_UNAVAILABLE,
      error instanceof Error ? { cause: error.message } : undefined,
    );
  }
}
