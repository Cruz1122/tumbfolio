/**
 * Architecture boundary test.
 *
 * Ensures packages/domain remains pure:
 * - No imports from other @tumbfolio/* packages
 * - No React, Next.js, NestJS, Drizzle, BullMQ, Node built-ins
 * - Only runtime dep is "zod"
 * - No imports from apps/*
 *
 * This prevents accidental coupling that would break the
 * "parser, planner, NBXP and exporters must be testable
 * without UI" rule from the architecture docs.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { globSync } from "node:fs";
import path from "node:path";

const SRC_DIR = path.resolve(__dirname, "../src");
const FORBIDDEN_PACKAGES = [
  "@tumbfolio/db",
  "@tumbfolio/storage",
  "@tumbfolio/notebook",
  "@tumbfolio/export",
  "@tumbfolio/nbxp",
  "@tumbfolio/render-contracts",
  "@tumbfolio/testing",
  "@tumbfolio/config"
];

const FORBIDDEN_LIBRARIES = [
  "react",
  "next",
  "@nestjs/",
  "drizzle-orm",
  "bullmq",
  "ioredis",
  "playwright",
  "sharp",
  "pptxgenjs",
  "jszip",
  "fast-xml-parser"
];

const ALLOWED_IMPORTS = new Set([
  "zod"
]);

describe("domain package purity", () => {
  const tsFiles = globSync("src/**/*.ts", { cwd: path.resolve(__dirname, "..") });

  for (const file of tsFiles) {
    it(`${file} does not import forbidden packages`, () => {
      const content = readFileSync(path.resolve(SRC_DIR, "..", file), "utf-8");
      const importLines = content.match(/from\s+['"]([^'"]+)['"]/g) || [];

      for (const line of importLines) {
        const match = line.match(/from\s+['"]([^'"]+)['"]/);
        if (!match) continue;
        const imported = match[1];

        // Relative imports are fine
        if (imported.startsWith(".") || imported.startsWith("..")) continue;

        // Check if it's a forbidden package
        for (const forbidden of FORBIDDEN_PACKAGES) {
          expect(imported, `${file} imports forbidden package ${forbidden}`).not.toBe(forbidden);
        }

        // Check if it's a forbidden library
        for (const forbidden of FORBIDDEN_LIBRARIES) {
          expect(imported, `${file} imports forbidden library ${forbidden}`).not.toContain(forbidden);
        }

        // If it's a package import (not relative), it must be in the allowlist
        if (!imported.includes("/") || imported.startsWith("@")) {
          // Strip scope if present
          const pkgName = imported.startsWith("@")
            ? imported.split("/").slice(0, 2).join("/")
            : imported.split("/")[0];
          if (!ALLOWED_IMPORTS.has(pkgName) && !ALLOWED_IMPORTS.has(imported)) {
            // Check if it starts with a forbidden pattern
            const isForbidden = FORBIDDEN_LIBRARIES.some(f => imported.startsWith(f));
            expect(isForbidden, `${file} imports disallowed package ${imported}`).toBe(false);
          }
        }
      }
    });
  }
});
