import { createHash, randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getApiEnv } from "@tumbfolio/config";

export type StorageNamespace = "notebooks" | "assets" | "exports" | "nbxp" | "thumbnails";

export type StoredObject = {
  storageKey: string;
  mediaType: string;
  sizeBytes: number;
  sha256: string;
};

export type PutObjectInput = {
  namespace: StorageNamespace;
  filename: string;
  body: Uint8Array;
  mediaType: string;
};

export interface ObjectStorage {
  putObject(input: PutObjectInput): Promise<StoredObject>;
  createPresignedPutUrl(input: {
    namespace: StorageNamespace;
    filename: string;
    mediaType: string;
    expiresInSeconds?: number;
  }): Promise<{ storageKey: string; url: string }>;
}

export function sha256Hex(input: Uint8Array | string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function createStableStorageKey(namespace: StorageNamespace, filename: string): string {
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return `${namespace}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeFilename || "file"}`;
}

export class S3ObjectStorage implements ObjectStorage {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    const env = getApiEnv();
    this.bucket = env.S3_BUCKET;
    const clientConfig: ConstructorParameters<typeof S3Client>[0] = {
      region: env.S3_REGION,
      forcePathStyle: env.S3_FORCE_PATH_STYLE
    };

    if (env.S3_ENDPOINT) {
      clientConfig.endpoint = env.S3_ENDPOINT;
    }

    if (env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY) {
      clientConfig.credentials = {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY
      };
    }

    this.client = new S3Client(clientConfig);
  }

  async putObject(input: PutObjectInput): Promise<StoredObject> {
    const storageKey = createStableStorageKey(input.namespace, input.filename);
    const sha256 = sha256Hex(input.body);

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
        Body: input.body,
        ContentType: input.mediaType,
        Metadata: { sha256 }
      })
    );

    return {
      storageKey,
      mediaType: input.mediaType,
      sizeBytes: input.body.byteLength,
      sha256
    };
  }

  async createPresignedPutUrl(input: {
    namespace: StorageNamespace;
    filename: string;
    mediaType: string;
    expiresInSeconds?: number;
  }): Promise<{ storageKey: string; url: string }> {
    const storageKey = createStableStorageKey(input.namespace, input.filename);
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      ContentType: input.mediaType
    });
    const url = await getSignedUrl(this.client, command, {
      expiresIn: input.expiresInSeconds ?? 900
    });

    return { storageKey, url };
  }
}
