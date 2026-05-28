import { describe, expect, it } from "vitest";
import { buildStorageKey } from "../src/keys.js";

describe("buildStorageKey", () => {
  it("builds stable non-sensitive keys", () => {
    expect(
      buildStorageKey({
        namespace: "notebooks",
        projectId: "project_123",
        objectId: "notebook_456",
        extension: ".ipynb",
      }),
    ).toBe("notebooks/project_123/notebook_456.ipynb");
  });

  it("uses extension without leading dot when dot is omitted", () => {
    expect(
      buildStorageKey({
        namespace: "assets",
        projectId: "proj_1",
        objectId: "asset_2",
        extension: "png",
      }),
    ).toBe("assets/proj_1/asset_2.png");
  });

  it("rejects path traversal in projectId", () => {
    expect(() =>
      buildStorageKey({
        namespace: "assets",
        projectId: "../secret",
        objectId: "asset_1",
        extension: "png",
      }),
    ).toThrow();
  });

  it("rejects path traversal in objectId", () => {
    expect(() =>
      buildStorageKey({
        namespace: "notebooks",
        projectId: "proj_1",
        objectId: "../../etc/passwd",
        extension: "ipynb",
      }),
    ).toThrow();
  });

  it("rejects empty segments", () => {
    expect(() =>
      buildStorageKey({
        namespace: "notebooks",
        projectId: "",
        objectId: "obj_1",
        extension: "ipynb",
      }),
    ).toThrow();
  });

  it("does not require original filename", () => {
    const key = buildStorageKey({
      namespace: "assets",
      projectId: "project_123",
      objectId: "asset_456",
      extension: "png",
    });

    expect(key).not.toContain("customer");
    expect(key).not.toContain("analysis");
  });
});
