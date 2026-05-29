import { Controller, Get, Param } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { ApiDefaultErrorResponses } from "../../common/decorators/api-error-responses.decorator.js";
import type { AssetIdParamDto } from "../../common/dto/uuid-param.dto.js";
import { AssetDownloadUrlDto, AssetDto } from "./dto/asset.dto.js";
import { AssetsService } from "./assets.service.js";

@ApiTags("assets")
@ApiDefaultErrorResponses()
@Controller("assets")
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get(":assetId")
  @ApiOkResponse({ type: AssetDto })
  getById(@Param() params: AssetIdParamDto): Promise<AssetDto> {
    return this.assetsService.getById(params.assetId);
  }

  @Get(":assetId/download-url")
  @ApiOkResponse({ type: AssetDownloadUrlDto })
  getDownloadUrl(
    @Param() params: AssetIdParamDto,
  ): Promise<AssetDownloadUrlDto> {
    return this.assetsService.getDownloadUrl(params.assetId);
  }
}
