import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsObject, IsOptional, IsUUID } from "class-validator";

export class CreateAiSuggestionDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  presentation_id!: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  slide_id?: string;

  @ApiProperty({
    enum: [
      "generate_title",
      "improve_title",
      "summarize_slide",
      "speaker_notes",
      "suggest_visibility",
      "create_conclusion",
    ],
  })
  @IsIn([
    "generate_title",
    "improve_title",
    "summarize_slide",
    "speaker_notes",
    "suggest_visibility",
    "create_conclusion",
  ])
  action_type!: string;

  @ApiPropertyOptional({ example: { tone: "executive" } })
  @IsOptional()
  @IsObject()
  options?: Record<string, unknown>;
}
