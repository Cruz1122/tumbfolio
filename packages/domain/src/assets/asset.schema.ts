import { z } from "zod";
import { uuidSchema, storageKeySchema, sha256Schema, isoDateTimeSchema, JsonObjectSchema } from "../schemas/index.js";
import { AssetType } from "../enums/index.js";

export const AssetSchema = z.object({
  id: uuidSchema,
  projectId: uuidSchema,
  sourceNotebookId: uuidSchema.optional(),
  sourceCellId: uuidSchema.optional(),
  sourceOutputId: uuidSchema.optional(),
  storageKey: storageKeySchema,
  filename: z.string().optional(),
  mediaType: z.string().min(1),
  assetType: z.nativeEnum(AssetType),
  fileSizeBytes: z.number().int().nonnegative().optional(),
  sha256: sha256Schema.optional(),
  width: z.number().int().nonnegative().optional(),
  height: z.number().int().nonnegative().optional(),
  metadata: JsonObjectSchema.default({}),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema
});

export type Asset = z.infer<typeof AssetSchema>;
