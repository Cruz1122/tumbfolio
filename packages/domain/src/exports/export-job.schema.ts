import { z } from "zod";
import { uuidSchema, isoDateTimeSchema } from "../schemas/index.js";
import { JobStatus, ExportType } from "../enums/index.js";
import { ExportConfigSchema } from "./export-config.schema.js";

export const ExportJobSchema = z.object({
  id: uuidSchema,
  presentationId: uuidSchema,
  exportType: z.nativeEnum(ExportType),
  status: z.nativeEnum(JobStatus).default("queued"),
  config: ExportConfigSchema,
  resultAssetId: uuidSchema.optional(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
  startedAt: isoDateTimeSchema.optional(),
  completedAt: isoDateTimeSchema.optional(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema
});

export type ExportJob = z.infer<typeof ExportJobSchema>;
