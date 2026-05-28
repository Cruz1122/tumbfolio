import { Body, Controller, Delete, Param, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { ApiDefaultErrorResponses } from "../../common/decorators/api-error-responses.decorator.js";
import type { ShareLinkIdParamDto } from "../../common/dto/uuid-param.dto.js";
import type { CreateShareLinkDto } from "./dto/create-share-link.dto.js";
import { ShareLinkDto } from "./dto/share-link.dto.js";
import type { SharingService } from "./sharing.service.js";

@ApiTags("sharing")
@ApiDefaultErrorResponses()
@Controller("sharing")
export class SharingController {
  constructor(private readonly sharingService: SharingService) {}

  @Post("links")
  @ApiCreatedResponse({ type: ShareLinkDto })
  create(@Body() dto: CreateShareLinkDto): Promise<ShareLinkDto> {
    return this.sharingService.create(dto);
  }

  @Delete("links/:shareLinkId")
  @ApiOkResponse({ schema: { example: { revoked: true } } })
  revoke(
    @Param() params: ShareLinkIdParamDto,
  ): Promise<{ revoked: true }> {
    return this.sharingService.revoke(params.shareLinkId);
  }
}
