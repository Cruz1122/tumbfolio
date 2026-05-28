import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const idSchema = z.string().min(1);

export const isoDateTimeSchema = z.string().datetime();

export const nonEmptyStringSchema = z.string().min(1);

/** Basic MIME type validation (type/subtype pattern) */
export const mimeTypeSchema = z
  .string()
  .regex(/^[a-zA-Z0-9!#$&^_.+-]+\/[a-zA-Z0-9!#$&^_.+-]+$/);

/** SHA-256 hex string (64 hex chars) */
export const sha256Schema = z
  .string()
  .regex(/^[a-f0-9]{64}$/);

/** Storage key: non-empty, no leading/trailing whitespace */
export const storageKeySchema = z.string().min(1).trim();
