import { HttpStatus, Injectable } from "@nestjs/common";
import { ApiErrorCode } from "../../common/errors/api-error-code.js";
import { ApiException } from "../../common/errors/api.exception.js";
import type { AssetDownloadUrlDto, AssetDto } from "./dto/asset.dto.js";

@Injectable()
export class AssetsService {
  getById(_assetId: string): Promise<AssetDto> {
    return this.notImplemented("Asset lookup is not implemented yet.");
  }

  getDownloadUrl(_assetId: string): Promise<AssetDownloadUrlDto> {
    return this.notImplemented("Asset download URL is not implemented yet.");
  }

  private notImplemented(message: string): never {
    throw new ApiException(
      ApiErrorCode.NOT_IMPLEMENTED,
      message,
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}
