import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sql } from "drizzle-orm";
import { createDbClient } from "../client.js";
import { themes } from "../schema.js";

/* ------------------------------------------------------------------ */
/*  Load DATABASE_URL from .env for use in scripts                     */
/* ------------------------------------------------------------------ */

function readDatabaseUrl(): string {
  if (process.env["DATABASE_URL"]) return process.env["DATABASE_URL"]!;

  // Search up from CWD for .env
  let dir = process.cwd();
  for (let i = 0; i < 5; i++) {
    try {
      const envPath = resolve(dir, ".env");
      const content = readFileSync(envPath, "utf-8");
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (trimmed.startsWith("DATABASE_URL=")) {
          return trimmed.slice("DATABASE_URL=".length).replace(/^["']|["']$/g, "");
        }
      }
    } catch {
      // try parent
    }
    dir = resolve(dir, "..");
  }

  throw new Error(
    "DATABASE_URL is required. Set it as an environment variable or add it to .env"
  );
}

/* ------------------------------------------------------------------ */
/*  Theme definitions (shape compatible with domain ThemeTokensSchema) */
/* ------------------------------------------------------------------ */

const systemThemes = [
  {
    slug: "colab-clean",
    name: "Colab Clean",
    description: "Clean technical theme for notebooks, demos and teaching.",
    isBuiltin: true,
    tokensJson: {
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
    }
  },
  {
    slug: "academic-paper",
    name: "Academic Paper",
    description: "Sober theme for research, papers and formal teaching.",
    isBuiltin: true,
    tokensJson: {
      colors: {
        background: "#FFFFFF",
        foreground: "#1F2937",
        muted: "#4B5563",
        accent: "#C2410C",
        border: "#E5E7EB",
        codeBackground: "#F9FAFB"
      },
      typography: {
        headingFont: "'Georgia', serif",
        bodyFont: "'Georgia', serif",
        codeFont: "'JetBrains Mono', monospace"
      },
      layout: {
        slideWidth: "1280px",
        slideHeight: "720px",
        contentMaxWidth: "960px",
        density: "comfortable"
      }
    }
  },
  {
    slug: "executive-data",
    name: "Executive Data",
    description: "Output-first theme for stakeholders and business reviews.",
    isBuiltin: true,
    tokensJson: {
      colors: {
        background: "#FFFFFF",
        foreground: "#111827",
        muted: "#4B5563",
        accent: "#EA580C",
        border: "#E5E7EB",
        codeBackground: "#FFF7ED"
      },
      typography: {
        headingFont: "'Inter', sans-serif",
        bodyFont: "'Inter', sans-serif",
        codeFont: "'JetBrains Mono', monospace"
      },
      layout: {
        slideWidth: "1280px",
        slideHeight: "720px",
        contentMaxWidth: "1024px",
        density: "comfortable"
      }
    }
  }
] as const;

/* ------------------------------------------------------------------ */
/*  Run                                                               */
/* ------------------------------------------------------------------ */

const databaseUrl = readDatabaseUrl();
const { db, close } = createDbClient(databaseUrl);

try {
  for (const theme of systemThemes) {
    await db
      .insert(themes)
      .values({
        slug: theme.slug,
        name: theme.name,
        description: theme.description,
        isBuiltin: theme.isBuiltin,
        tokensJson: theme.tokensJson
      })
      .onConflictDoUpdate({
        target: themes.slug,
        set: {
          name: sql`excluded.name`,
          description: sql`excluded.description`,
          isBuiltin: sql`excluded.is_builtin`,
          tokensJson: sql`excluded.tokens_json`,
          updatedAt: new Date()
        }
      });
  }

  console.log("System themes seeded.");
} finally {
  await close();
}
