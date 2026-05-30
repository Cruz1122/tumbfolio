import {
  CreateBucketCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { describe, expect, it, vi } from "vitest";
import { S3ObjectStorage } from "../src/s3-object-storage.js";

describe("S3ObjectStorage", () => {
  it("creates the bucket when it does not exist", async () => {
    const send = vi
      .fn()
      .mockRejectedValueOnce(Object.assign(new Error("missing"), { name: "NotFound" }))
      .mockResolvedValueOnce({});

    const storage = new S3ObjectStorage({
      bucket: "tumbfolio-local",
      clientConfig: {},
      client: {
        send,
      },
    });

    await storage.ensureBucketExists();

    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0]?.[0]).toBeInstanceOf(HeadBucketCommand);
    expect(send.mock.calls[1]?.[0]).toBeInstanceOf(CreateBucketCommand);
  });
});
