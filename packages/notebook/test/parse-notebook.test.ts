import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseNotebookJson } from "../src/index.js";

const fixturesDir = join(import.meta.dirname, "fixtures");

function readFixture(name: string) {
  return readFileSync(join(fixturesDir, name), "utf8");
}

describe("parseNotebookJson", () => {
  it("normalizes markdown and code cells with outputs", () => {
    const parsed = parseNotebookJson(readFixture("html-output.ipynb"));

    expect(parsed.cells).toHaveLength(1);
    expect(parsed.cells[0]?.cell_type).toBe("code");
    expect(parsed.cells[0]?.source).toBe("df.head()");
    expect(parsed.cells[0]?.outputs[0]?.mime_type).toBe("text/html");
    expect(parsed.cells[0]?.outputs[0]?.render_strategy).toBe("html");
  });

  it("normalizes image outputs with image strategy", () => {
    const parsed = parseNotebookJson(readFixture("image-output.ipynb"));

    expect(parsed.cells[0]?.outputs[0]).toMatchObject({
      output_type: "display_data",
      mime_type: "image/png",
      render_strategy: "image",
      priority: 100,
    });
  });

  it("normalizes stream and error outputs", () => {
    const parsed = parseNotebookJson(readFixture("stream-error.ipynb"));
    const outputs = parsed.cells[0]?.outputs ?? [];

    expect(outputs[0]).toMatchObject({
      output_type: "stream",
      name: "stderr",
      render_strategy: "stream",
      is_noise: true,
    });
    expect(outputs[1]).toMatchObject({
      output_type: "error",
      render_strategy: "error",
      is_noise: true,
      ename: "ValueError",
    });
  });
});
