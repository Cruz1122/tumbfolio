import type {
  CompleteNotebookUploadRequest,
  CompleteNotebookUploadResponse,
  InitiateNotebookUploadRequest,
  InitiateNotebookUploadResponse,
  UploadUiError,
} from "./notebook-upload.types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

type ApiErrorBody = {
  error_code?: string;
  message?: string;
};

function toUserError(
  fallbackCode: string,
  fallbackTitle: string,
  fallbackMessage: string,
  body?: ApiErrorBody,
): UploadUiError {
  const code = body?.error_code ?? fallbackCode;

  const messageByCode: Record<string, string> = {
    API_UNAVAILABLE:
      "No se pudo conectar con la API de Tumbfolio. Verifica que el backend esté levantado.",
    DATABASE_UNAVAILABLE:
      "La base de datos no está disponible. Levanta Postgres e intenta de nuevo.",
    FILE_TOO_LARGE: "El notebook supera el tamaño máximo permitido.",
    INVALID_FILE_TYPE: "Solo se aceptan notebooks .ipynb ejecutados.",
    UNSUPPORTED_CONTENT_TYPE:
      "El tipo de archivo subido no es compatible.",
    STORAGE_UNAVAILABLE:
      "El almacenamiento no está disponible. Verifica MinIO o S3 e intenta de nuevo.",
    STORAGE_OBJECT_NOT_FOUND:
      "El archivo no llegó al almacenamiento. Intenta de nuevo.",
    STORAGE_METADATA_MISMATCH:
      "Los metadatos del archivo no coinciden con el notebook seleccionado.",
    INVALID_SHA256: "El hash del archivo subido es inválido.",
    VALIDATION_FAILED: "La validación del servidor falló.",
    INVALID_INPUT: "Los datos enviados no son válidos.",
    NOT_FOUND: "El archivo no se encontró en el almacenamiento.",
  };

  return {
    code,
    title: fallbackTitle,
    message: messageByCode[code] ?? body?.message ?? fallbackMessage,
  };
}

async function readJsonSafely(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

async function apiPost<TResponse>(
  path: string,
  body: unknown,
): Promise<TResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw toUserError(
      "API_UNAVAILABLE",
      "No se pudo conectar",
      "La API de Tumbfolio no responde.",
    );
  }

  const payload = await readJsonSafely(response);

  if (!response.ok) {
    throw toUserError(
      "API_REQUEST_FAILED",
      "La solicitud falló",
      "Tumbfolio no pudo procesar la carga del notebook.",
      payload && typeof payload === "object"
        ? (payload as ApiErrorBody)
        : undefined,
    );
  }

  return payload as TResponse;
}

export async function initiateNotebookUpload(
  input: InitiateNotebookUploadRequest,
): Promise<InitiateNotebookUploadResponse> {
  const result = await apiPost<InitiateNotebookUploadResponse>(
    "/notebooks/uploads/initiate",
    input,
  );

  if (
    !result.upload_id ||
    !result.storage_key ||
    !result.upload_url
  ) {
    throw {
      code: "UPLOAD_INIT_FAILED",
      title: "No se pudo iniciar la carga",
      message:
        "El servidor no devolvió los datos necesarios para la carga.",
    } satisfies UploadUiError;
  }

  return result;
}

export async function completeNotebookUpload(
  input: CompleteNotebookUploadRequest,
): Promise<CompleteNotebookUploadResponse> {
  return apiPost<CompleteNotebookUploadResponse>(
    "/notebooks/uploads/complete",
    input,
  );
}

export function uploadFileToSignedUrl(params: {
  uploadUrl: string;
  file: File;
  headers?: Record<string, string>;
  onProgress?: (progress: number) => void;
}): Promise<void> {
  const { uploadUrl, file, headers, onProgress } = params;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", uploadUrl);

    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        xhr.setRequestHeader(key, value);
      }
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) {
        return;
      }

      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }

      reject({
        code: "SIGNED_UPLOAD_FAILED",
        title: "Error al subir el archivo",
        message:
          "No se pudo subir el notebook al almacenamiento. Intenta de nuevo.",
      } satisfies UploadUiError);
    };

    xhr.onerror = () => {
      reject({
        code: "SIGNED_UPLOAD_FAILED",
        title: "Error al subir el archivo",
        message:
          "No se pudo subir el notebook. Revisa tu conexión e intenta de nuevo.",
      } satisfies UploadUiError);
    };

    xhr.send(file);
  });
}
