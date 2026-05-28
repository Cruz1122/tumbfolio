import { HttpStatus, Injectable } from "@nestjs/common";
import { ApiErrorCode } from "../../common/errors/api-error-code.js";
import { ApiException } from "../../common/errors/api.exception.js";
import type { CreateShareLinkDto } from "./dto/create-share-link.dto.js";
import type { ShareLinkDto } from "./dto/share-link.dto.js";

@Injectable()
export class SharingService {
  create(_dto: CreateShareLinkDto): Promise<ShareLinkDto> {
    return this.notImplemented("Share link creation is not implemented yet.");
  }

  revoke(_shareLinkId: string): Promise<{ revoked: true }> {
    return this.notImplemented("Share link revocation is not implemented yet.");
  }

  private notImplemented(message: string): never {
    throw new ApiException(
      ApiErrorCode.NOT_IMPLEMENTED,
      message,
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}
