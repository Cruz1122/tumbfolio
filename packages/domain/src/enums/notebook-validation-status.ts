export const NotebookValidationStatus = {
  Pending: "pending",
  Validating: "validating",
  Valid: "valid",
  Invalid: "invalid"
} as const;

export type NotebookValidationStatus = (typeof NotebookValidationStatus)[keyof typeof NotebookValidationStatus];
