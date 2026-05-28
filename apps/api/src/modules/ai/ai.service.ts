import { HttpStatus, Injectable } from "@nestjs/common";
import { ApiErrorCode } from "../../common/errors/api-error-code.js";
import { ApiException } from "../../common/errors/api.exception.js";
import type { AiSuggestionDto } from "./dto/ai-suggestion.dto.js";
import type { CreateAiSuggestionDto } from "./dto/create-ai-suggestion.dto.js";

@Injectable()
export class AiService {
  createSuggestion(_dto: CreateAiSuggestionDto): Promise<AiSuggestionDto> {
    throw new ApiException(
      ApiErrorCode.NOT_IMPLEMENTED,
      "AI suggestions are not implemented yet. T-24 will connect guardrails and provider calls.",
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}
