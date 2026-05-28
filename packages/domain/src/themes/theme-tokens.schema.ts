import { z } from "zod";

const ThemeColorTokensSchema = z.object({
  background: z.string(),
  foreground: z.string(),
  muted: z.string(),
  accent: z.string(),
  border: z.string(),
  codeBackground: z.string()
});

const ThemeTypographyTokensSchema = z.object({
  headingFont: z.string(),
  bodyFont: z.string(),
  codeFont: z.string()
});

const ThemeLayoutTokensSchema = z.object({
  slideWidth: z.string(),
  slideHeight: z.string(),
  contentMaxWidth: z.string(),
  density: z.enum(["comfortable", "compact", "spacious"])
});

export const ThemeTokensSchema = z.object({
  colors: ThemeColorTokensSchema,
  typography: ThemeTypographyTokensSchema,
  layout: ThemeLayoutTokensSchema
});

export type ThemeTokens = z.infer<typeof ThemeTokensSchema>;
