import { ThemeSchema, type Theme } from "../themes/index.js";

export const FIXTURE_THEME_ID = "00000000-0000-4000-8000-000000000080";

export const themeFixture: Theme = ThemeSchema.parse({
  id: FIXTURE_THEME_ID,
  name: "Colab Clean",
  slug: "colab-clean",
  isBuiltin: true,
  tokens: {
    colors: {
      background: "#FFFFFF",
      foreground: "#1F2937",
      muted: "#F3F4F6",
      accent: "#EA580C",
      border: "#E5E7EB",
      codeBackground: "#F9FAFB"
    },
    typography: {
      headingFont: "'Inter', sans-serif",
      bodyFont: "'Inter', sans-serif",
      codeFont: "'JetBrains Mono', monospace"
    },
    layout: {
      slideWidth: "1280px",
      slideHeight: "720px",
      contentMaxWidth: "960px",
      density: "comfortable"
    }
  },
  createdAt: "2026-05-28T10:00:00.000Z",
  updatedAt: "2026-05-28T10:00:00.000Z"
});
