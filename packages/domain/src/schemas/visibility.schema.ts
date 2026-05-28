import { z } from "zod";

export const BlockVisibilitySchema = z.object({
  showCode: z.boolean().default(false),
  showOutput: z.boolean().default(true),
  showMarkdown: z.boolean().default(true),
  collapseCode: z.boolean().default(true),
  collapseLogs: z.boolean().default(true),
  renderOutputAsImage: z.boolean().default(false),
  includeInExport: z.boolean().default(true),
  visibleInEditor: z.boolean().default(true)
});

export type BlockVisibility = z.infer<typeof BlockVisibilitySchema>;

export const DefaultBlockVisibility: BlockVisibility = {
  showCode: false,
  showOutput: true,
  showMarkdown: true,
  collapseCode: true,
  collapseLogs: true,
  renderOutputAsImage: false,
  includeInExport: true,
  visibleInEditor: true
};
