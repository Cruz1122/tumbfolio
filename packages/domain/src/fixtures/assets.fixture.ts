import { AssetSchema, type Asset } from "../assets/index.js";

export const assetFixture: Asset = AssetSchema.parse({
  id: "00000000-0000-4000-8000-000000000070",
  projectId: "00000000-0000-4000-8000-000000000001",
  storageKey: "assets/2026-05/abc123-output.png",
  mediaType: "image/png",
  assetType: "output_image",
  fileSizeBytes: 204800,
  sha256: "b".repeat(64),
  width: 800,
  height: 600,
  metadata: {},
  createdAt: "2026-05-28T10:00:00.000Z",
  updatedAt: "2026-05-28T10:00:00.000Z"
});
