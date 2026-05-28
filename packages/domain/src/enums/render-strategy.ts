export const RenderStrategy = {
  Markdown: "markdown",
  Code: "code",
  PlainText: "plain_text",
  HtmlSanitized: "html_sanitized",
  HtmlSandboxed: "html_sandboxed",
  Image: "image",
  Svg: "svg",
  Latex: "latex",
  DataFrame: "data_frame",
  Stream: "stream",
  Error: "error",
  Placeholder: "placeholder",
  Unsupported: "unsupported"
} as const;

export type RenderStrategy = (typeof RenderStrategy)[keyof typeof RenderStrategy];
