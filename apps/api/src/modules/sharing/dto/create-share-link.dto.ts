import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsOptional, IsUUID } from "class-validator";

export class CreateShareLinkDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  presentation_id!: string;

  @ApiProperty({ enum: ["view_only", "duplicate", "download_enabled"] })
  @IsIn(["view_only", "duplicate", "download_enabled"])
  permission!: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  expires?: boolean;
}
