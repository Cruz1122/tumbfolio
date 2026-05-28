import { Body, Controller, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiTags } from "@nestjs/swagger";
import { ApiDefaultErrorResponses } from "../../common/decorators/api-error-responses.decorator.js";
import type { CreateNbxpExportDto} from "./dto/nbxp.dto.js";
import { NbxpExportDto } from "./dto/nbxp.dto.js";
import type { NbxpService } from "./nbxp.service.js";

@ApiTags("nbxp")
@ApiDefaultErrorResponses()
@Controller("nbxp")
export class NbxpController {
  constructor(private readonly nbxpService: NbxpService) {}

  @Post("exports")
  @ApiCreatedResponse({ type: NbxpExportDto })
  createExport(@Body() dto: CreateNbxpExportDto): Promise<NbxpExportDto> {
    return this.nbxpService.createExport(dto);
  }
}
