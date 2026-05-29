"use client";

import { useCallback, useMemo, useState } from "react";

import { NOTEBOOK_CONTENT_TYPE } from "./notebook-upload.constants";
import {
  completeNotebookUpload,
  initiateNotebookUpload,
  uploadFileToSignedUrl,
} from "./notebook-upload.api";
import { calculateFileSha256 } from "./notebook-upload.hash";
import {
  getNotebookContentType,
  validateNotebookFile,
} from "./notebook-upload.validation";
import type {
  NotebookUploadResult,
  NotebookUploadStatus,
  UploadUiError,
} from "./notebook-upload.types";

type UseNotebookUploadOptions = {
  onCompleted?: (result: NotebookUploadResult) => void;
};

type UseNotebookUploadResult = {
  status: NotebookUploadStatus;
  progress: number;
  selectedFile: File | null;
  error: UploadUiError | null;
  isBusy: boolean;
  uploadNotebook: (file: File) => Promise<void>;
  resetUpload: () => void;
};

function normalizeUnknownError(error: unknown): UploadUiError {
  if (
    error &&
    typeof error === "object" &&
    "title" in error &&
    "message" in error &&
    "code" in error
  ) {
    return error as UploadUiError;
  }

  return {
    code: "UNKNOWN_UPLOAD_ERROR",
    title: "Error al cargar",
    message:
      "No se pudo cargar el notebook. Intentá de nuevo.",
  };
}

export function useNotebookUpload(
  options: UseNotebookUploadOptions = {},
): UseNotebookUploadResult {
  const [status, setStatus] = useState<NotebookUploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<UploadUiError | null>(null);

  const isBusy = useMemo(
    () =>
      status === "hashing" ||
      status === "initiating" ||
      status === "uploading" ||
      status === "completing",
    [status],
  );

  const resetUpload = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setSelectedFile(null);
    setError(null);
  }, []);

  const uploadNotebook = useCallback(
    async (file: File) => {
      setSelectedFile(file);
      setError(null);
      setProgress(0);

      const validationError = validateNotebookFile(file);

      if (validationError) {
        setStatus("failed");
        setError(validationError);
        return;
      }

      const contentType =
        getNotebookContentType(file) || NOTEBOOK_CONTENT_TYPE;

      try {
        setStatus("hashing");
        const sha256 = await calculateFileSha256(file);

        setStatus("initiating");
        const initiated = await initiateNotebookUpload({
          original_filename: file.name,
          content_type: contentType,
          file_size_bytes: file.size,
          sha256,
        });

        setStatus("uploading");
        await uploadFileToSignedUrl({
          uploadUrl: initiated.upload_url,
          file,
          headers: {
            "Content-Type": contentType,
          },
          onProgress: setProgress,
        });

        setStatus("completing");
        const completed = await completeNotebookUpload({
          storage_key: initiated.storage_key,
          original_filename: file.name,
          file_size_bytes: file.size,
          sha256,
        });

        const result: NotebookUploadResult = {
          ...completed,
          sha256,
          original_filename: file.name,
          file_size_bytes: file.size,
          storage_key: initiated.storage_key,
        };

        setProgress(100);
        setStatus("uploaded");
        options.onCompleted?.(result);
      } catch (caughtError) {
        setStatus("failed");
        setError(normalizeUnknownError(caughtError));
      }
    },
    [options],
  );

  return {
    status,
    progress,
    selectedFile,
    error,
    isBusy,
    uploadNotebook,
    resetUpload,
  };
}
