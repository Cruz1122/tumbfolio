import { HttpStatus, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { ApiErrorCode } from "../../common/errors/api-error-code.js";
import { ApiException } from "../../common/errors/api.exception.js";
import type {
  CompleteNotebookUploadDto,
  CompleteNotebookUploadResponseDto,
} from "./dto/complete-notebook-upload.dto.js";
import type {
  InitiateNotebookUploadDto,
  InitiateNotebookUploadResponseDto,
} from "./dto/initiate-notebook-upload.dto.js";
import { DbService } from "../database/database.service.js";
import { StorageService } from "../storage/storage.service.js";

const MAX_NOTEBOOK_SIZE_BYTES = 50 * 1024 * 1024;
const NOTEBOOK_UPLOAD_TTL_SECONDS = 900;
const NOTEBOOK_CONTENT_TYPE = "application/x-ipynb+json";

@Injectable()
export class NotebookUploadsService {
  constructor(
    private readonly storage: StorageService,
    private readonly db: DbService,
  ) {}

  async initiateUpload(
    input: InitiateNotebookUploadDto,
  ): Promise<InitiateNotebookUploadResponseDto> {
    if (!input.original_filename.toLowerCase().endsWith(".ipynb")) {
      throw new ApiException(
        ApiErrorCode.INVALID_INPUT,
        "Only .ipynb notebooks are supported.",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (input.file_size_bytes > MAX_NOTEBOOK_SIZE_BYTES) {
      throw new ApiException(
        ApiErrorCode.FILE_TOO_LARGE,
        "Notebook exceeds the maximum allowed size.",
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }

    const uploadId = randomUUID();
    const storageKey = `notebooks/local-user/${uploadId}/source.ipynb`;

    const uploadUrl = await this.storage.createSignedUploadUrl({
      key: storageKey,
      contentType: NOTEBOOK_CONTENT_TYPE,
      expiresInSeconds: NOTEBOOK_UPLOAD_TTL_SECONDS,
      metadata: {
        original_filename: input.original_filename,
        sha256: input.sha256,
      },
    });

    return {
      upload_id: uploadId,
      storage_key: storageKey,
      upload_url: uploadUrl,
      expires_in_seconds: NOTEBOOK_UPLOAD_TTL_SECONDS,
      status: "accepted",
    };
  }

  async completeUpload(
    input: CompleteNotebookUploadDto,
  ): Promise<CompleteNotebookUploadResponseDto> {
    const object = await this.storage.headObject(input.storage_key);

    if (!object) {
      throw new ApiException(
        ApiErrorCode.NOT_FOUND,
        "Uploaded notebook was not found in storage.",
        HttpStatus.NOT_FOUND,
      );
    }

    if (object.size !== input.file_size_bytes) {
      throw new ApiException(
        ApiErrorCode.INVALID_INPUT,
        "Uploaded file size does not match the expected size.",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (object.metadata?.sha256 && object.metadata.sha256 !== input.sha256) {
      throw new ApiException(
        ApiErrorCode.INVALID_INPUT,
        "Uploaded notebook hash does not match the expected sha256.",
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.db.transaction(async (tx) => {
      const existingUser = await tx.findLocalUser();
      const user =
        existingUser ??
        (await tx.createUser({
          email: "local@tumbfolio.dev",
          name: "Local User",
        }));

      const project = await tx.createProject({
        userId: user.id,
        name: input.original_filename.replace(/\.ipynb$/i, ""),
        status: "active",
      });

      const sourceNotebook = await tx.createSourceNotebook({
        projectId: project.id,
        filename: input.original_filename,
        storageKey: input.storage_key,
        validationStatus: "pending",
        processingStatus: "idle",
        fileSizeBytes: input.file_size_bytes,
        sha256: input.sha256,
        metadataJson: {
          original_filename: input.original_filename,
          file_size_bytes: input.file_size_bytes,
          sha256: input.sha256,
          uploaded_at: new Date().toISOString(),
        },
      });

      return {
        project_id: project.id,
        source_notebook_id: sourceNotebook.id,
        validation_status: sourceNotebook.validationStatus,
        processing_status: sourceNotebook.processingStatus,
      };
    });
  }
}
