import type { NormalizedOutput, RenderStrategy } from "@tumbfolio/domain";

export type RenderContext = {
  presentationId: string;
  slideId?: string;
  blockId?: string;
  mode: "editor" | "present" | "export";
};

export type PptxElementDescription = {
  kind: "text" | "image" | "table" | "placeholder";
  payload: Record<string, unknown>;
};

export interface MimeRenderer<TNode = unknown> {
  readonly mimeType: string;
  readonly strategy: RenderStrategy;
  canRender(output: NormalizedOutput): boolean;
  render(output: NormalizedOutput, context: RenderContext): TNode;
  exportToImage?: (output: NormalizedOutput, context: RenderContext) => Promise<Uint8Array>;
  exportToPptx?: (output: NormalizedOutput, context: RenderContext) => PptxElementDescription;
}
