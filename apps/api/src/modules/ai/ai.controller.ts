import { Body, Controller, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiTags } from "@nestjs/swagger";
import { ApiDefaultErrorResponses } from "../../common/decorators/api-error-responses.decorator.js";
import type { AiService } from "./ai.service.js";
import { AiSuggestionDto } from "./dto/ai-suggestion.dto.js";
import type { CreateAiSuggestionDto } from "./dto/create-ai-suggestion.dto.js";

@ApiTags("ai")
@ApiDefaultErrorResponses()
@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("suggestions")
  @ApiCreatedResponse({ type: AiSuggestionDto })
  createSuggestion(
    @Body() dto: CreateAiSuggestionDto,
  ): Promise<AiSuggestionDto> {
    return this.aiService.createSuggestion(dto);
  }
}
