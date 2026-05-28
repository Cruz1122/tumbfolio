import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class UpdateSlideDto {
  @ApiPropertyOptional({ example: "Model performance overview" })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @ApiPropertyOptional({ example: "figure_focus" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  layout?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  slide_order?: number;
}
