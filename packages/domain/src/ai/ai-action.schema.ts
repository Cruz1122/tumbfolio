import { z } from "zod";
import { AiActionType } from "../enums/index.js";

export const AiActionSchema = z.nativeEnum(AiActionType);
export type AiAction = z.infer<typeof AiActionSchema>;
