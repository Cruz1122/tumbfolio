import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsObject, IsOptional, IsUUID } from "class-validator";

export class CreateExportJobDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  presentation_id!: string;

  @ApiProperty({ enum: ["html", "html_zip", "pdf", "pptx", "nbxp"] })
  @IsIn(["html", "html_zip", "pdf", "pptx", "nbxp"])
  export_type!: string;

  @ApiPropertyOptional({ example: { include_notes: false } })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
