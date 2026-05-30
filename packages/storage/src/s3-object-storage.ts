import type { Readable } from "node:stream";
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutBucketCorsCommand,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  DEFAULT_MULTIPART_PART_SIZE_BYTES,
  DEFAULT_MULTIPART_QUEUE_SIZE,
  DEFAULT_SIGNED_URL_TTL_SECONDS,
} from "./constants.js";
import { assertStorageKey } from "./keys.js";
import type {
  DeleteObjectInput,
  GetObjectResult,
  HeadObjectResult,
  MultipartUploadInput,
  ObjectStorage,
  PresignedUploadUrlInput,
  PresignedUrlInput,
  PutObjectInput,
  PutObjectResult,
} from "./types.js";

export type S3ObjectStorageConfig = {
  bucket: string;
  clientConfig: S3ClientConfig;
  client?: Pick<S3Client, "send">;
};

export class S3ObjectStorage implements ObjectStorage {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(config: S3ObjectStorageConfig) {
    this.bucket = config.bucket;
    this.client = (config.client as S3Client | undefined) ?? new S3Client(config.clientConfig);
  }

  async ensureBucketExists(): Promise<void> {
    try {
      await this.client.send(
        new HeadBucketCommand({
          Bucket: this.bucket,
        }),
      );
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "NotFound" || error.name === "NoSuchBucket")
      ) {
        await this.client.send(
          new CreateBucketCommand({
            Bucket: this.bucket,
          }),
        );
        return;
      }

      throw error;
    }
  }

  async putObject(input: PutObjectInput): Promise<PutObjectResult> {
    assertStorageKey(input.key);

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
        Metadata: input.metadata,
      }),
    );

    return {
      key: input.key,
      bucket: this.bucket,
      contentType: input.contentType,
    };
  }

  async multipartUpload(input: MultipartUploadInput): Promise<PutObjectResult> {
    assertStorageKey(input.key);

    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
        Metadata: input.metadata,
      },
      queueSize: input.queueSize ?? DEFAULT_MULTIPART_QUEUE_SIZE,
      partSize: input.partSizeBytes ?? DEFAULT_MULTIPART_PART_SIZE_BYTES,
      leavePartsOnError: false,
    });

    await upload.done();

    return {
      key: input.key,
      bucket: this.bucket,
      contentType: input.contentType,
    };
  }

  async getObject(key: string): Promise<GetObjectResult> {
    assertStorageKey(key);

    const result = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    return {
      key,
      contentType: result.ContentType,
      contentLength: result.ContentLength,
      body: result.Body as Readable,
    };
  }

  async headObject(key: string): Promise<HeadObjectResult | null> {
    assertStorageKey(key);

    try {
      const result = await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      return {
        key,
        contentType: result.ContentType,
        size: result.ContentLength,
        metadata: result.Metadata,
      };
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "NotFound" || error.name === "NoSuchKey")
      ) {
        return null;
      }
      throw error;
    }
  }

  async deleteObject(input: DeleteObjectInput): Promise<void> {
    assertStorageKey(input.key);

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
      }),
    );
  }

  async getSignedDownloadUrl(input: PresignedUrlInput): Promise<string> {
    assertStorageKey(input.key);

    return getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
      }),
      {
        expiresIn:
          input.expiresInSeconds ?? DEFAULT_SIGNED_URL_TTL_SECONDS,
      },
    );
  }

  async getSignedUploadUrl(input: PresignedUploadUrlInput): Promise<string> {
    assertStorageKey(input.key);

    return getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        ContentType: input.contentType,
        Metadata: input.metadata,
      }),
      {
        expiresIn:
          input.expiresInSeconds ?? DEFAULT_SIGNED_URL_TTL_SECONDS,
      },
    );
  }

  async setBucketCors(origins: string[]): Promise<void> {
    await this.client.send(
      new PutBucketCorsCommand({
        Bucket: this.bucket,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedOrigins: origins,
              AllowedMethods: ["PUT", "POST", "GET", "HEAD", "DELETE"],
              AllowedHeaders: [
                "Content-Type",
                "Content-MD5",
                "x-amz-*",
                "Authorization",
              ],
              ExposeHeaders: ["ETag"],
              MaxAgeSeconds: 3600,
            },
          ],
        },
      }),
    );
  }
}
