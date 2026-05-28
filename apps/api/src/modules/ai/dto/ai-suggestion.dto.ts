import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AiSuggestionDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ format: "uuid" })
  presentation_id!: string;

  @ApiPropertyOptional({ format: "uuid" })
  slide_id?: string;

  @ApiProperty({ example: "summarize_slide" })
  action_type!: string;

  @ApiProperty({ example: "pending" })
  status!: string;

  @ApiPropertyOptional()
  suggestion?: unknown;
}
