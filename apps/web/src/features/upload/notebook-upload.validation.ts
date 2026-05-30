import {
  ACCEPTED_BROWSER_MIME_TYPES,
  MAX_NOTEBOOK_FILE_SIZE_BYTES,
  NOTEBOOK_CONTENT_TYPE,
} from "./notebook-upload.constants";
import type { UploadUiError } from "./notebook-upload.types";

export function getNotebookContentType(file: File): string {
  if (
    !file.type ||
    file.type === "application/json" ||
    file.type === "application/octet-stream"
  ) {
    return NOTEBOOK_CONTENT_TYPE;
  }

  return file.type;
}

export function formatBytes(bytes: number): string {
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
}

export function validateNotebookFile(
  file: File | null | undefined,
): UploadUiError | null {
  if (!file) {
    return {
      code: "NO_FILE",
      title: "Sin archivo seleccionado",
      message: "Selecciona un notebook .ipynb ya ejecutado para continuar.",
    };
  }

  const lowerName = file.name.toLowerCase();

  if (!lowerName.endsWith(".ipynb")) {
    return {
      code: "INVALID_EXTENSION",
      title: "Formato no soportado",
      message:
        "Tumbfolio solo acepta archivos .ipynb en este paso.",
    };
  }

  if (file.size <= 0) {
    return {
      code: "NO_FILE",
      title: "Archivo vacío",
      message:
        "El notebook está vacío. Expórtalo o guárdalo de nuevo desde Jupyter o Colab.",
    };
  }

  if (file.size > MAX_NOTEBOOK_FILE_SIZE_BYTES) {
    return {
      code: "FILE_TOO_LARGE",
      title: "Notebook demasiado grande",
      message: `El límite actual es ${formatBytes(MAX_NOTEBOOK_FILE_SIZE_BYTES)}. Este archivo pesa ${formatBytes(file.size)}.`,
    };
  }

  if (!ACCEPTED_BROWSER_MIME_TYPES.has(file.type)) {
    return {
      code: "UNSUPPORTED_CONTENT_TYPE",
      title: "Tipo de archivo no soportado",
      message:
        "El navegador reportó un tipo de archivo no compatible. Usa un .ipynb estándar exportado desde Jupyter, Colab o VS Code.",
    };
  }

  return null;
}
