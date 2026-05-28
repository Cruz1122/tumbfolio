import { z } from "zod";

/**
 * Speaker notes schema.
 * In T-02 this is a simple string.
 * Future iterations may add structured content (bullet points, timestamps).
 */
export const SpeakerNotesSchema = z.string();
