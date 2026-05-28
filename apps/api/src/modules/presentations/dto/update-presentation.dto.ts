import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdatePresentationDto {
  @ApiPropertyOptional({ example: "Customer churn analysis" })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @ApiPropertyOptional({
    enum: ["default", "executive", "teaching", "research"],
  })
  @IsOptional()
  @IsIn(["default", "executive", "teaching", "research"])
  mode?: string;

  @ApiPropertyOptional({ example: "colab-clean" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  theme_id?: string;
}
