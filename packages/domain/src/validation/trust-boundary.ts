/**
 * Trust boundary policy for Tumbfolio domain validation.
 *
 * Three levels of data trust:
 *   A — External/untrusted input (upload, client payloads, NBXP import)
 *   B — Backend-generated data (normalized cells/outputs, planner output)
 *   C — Persisted data (DB reads)
 *
 * Schemas for level A use .strict() and minimal passthrough.
 * Schemas for level B use .strict().
 * Schemas for level C use .strict() or .strip() depending on adapter.
 * Notebook metadata field uses .passthrough() internally.
 */
export const TRUST_BOUNDARY = {
  EXTERNAL_INPUT: "external_input" as const,
  CLIENT_PAYLOAD: "client_payload" as const,
  BACKEND_GENERATED: "backend_generated" as const,
  PERSISTED: "persisted" as const,
  NBXP_IMPORTED: "nbxp_imported" as const
} as const;

export type TrustBoundary = (typeof TRUST_BOUNDARY)[keyof typeof TRUST_BOUNDARY];
