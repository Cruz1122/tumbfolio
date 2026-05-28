import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateProjectDto {
  @ApiProperty({ example: "Customer churn analysis" })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name!: string;

  @ApiPropertyOptional({ example: "Notebook imported from churn-analysis.ipynb" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
