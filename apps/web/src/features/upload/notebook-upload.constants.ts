export const MAX_NOTEBOOK_FILE_SIZE_BYTES = 25 * 1024 * 1024;

export const NOTEBOOK_CONTENT_TYPE = "application/x-ipynb+json";

export const ACCEPTED_NOTEBOOK_EXTENSIONS = [".ipynb"] as const;

export const ACCEPTED_BROWSER_MIME_TYPES = new Set([
  "",
  "application/json",
  "application/octet-stream",
  "application/x-ipynb+json",
]);

export const UPLOAD_STATUS_LABEL = {
  idle: "Listo",
  hashing: "Preparando archivo",
  initiating: "Iniciando carga",
  uploading: "Subiendo notebook",
  completing: "Finalizando proyecto",
  uploaded: "Notebook cargado",
  failed: "Carga fallida",
} as const;
