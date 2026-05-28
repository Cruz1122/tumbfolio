export const OutputType = {
  ExecuteResult: "execute_result",
  DisplayData: "display_data",
  Stream: "stream",
  Error: "error",
  Unknown: "unknown"
} as const;

export type OutputType = (typeof OutputType)[keyof typeof OutputType];
