export { TRUST_BOUNDARY } from "./trust-boundary.js";
export type { TrustBoundary } from "./trust-boundary.js";

export { UploadedNotebookMetadataSchema } from "./external-input.schema.js";
export type { UploadedNotebookMetadata } from "./external-input.schema.js";

export { BackendPresentationDocumentSchema } from "./backend-generated.schema.js";
export type { BackendPresentationDocument } from "./backend-generated.schema.js";

export {
  ClientUpdateSlideSchema,
  ClientUpdateBlockVisibilitySchema,
  ClientReorderSlidesSchema,
  ClientChangeThemeSchema,
  ClientChangeModeSchema
} from "./client-payload.schema.js";

export {
  NbxpImportedPresentationDocumentSchema,
  NbxpManifestSchema
} from "./nbxp-import.schema.js";
export type {
  NbxpImportedPresentationDocument,
  NbxpManifest
} from "./nbxp-import.schema.js";
