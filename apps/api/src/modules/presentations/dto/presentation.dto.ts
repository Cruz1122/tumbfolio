import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PresentationDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ format: "uuid" })
  project_id!: string;

  @ApiPropertyOptional({ format: "uuid" })
  source_notebook_id?: string;

  @ApiProperty({ example: "Customer churn analysis" })
  title!: string;

  @ApiProperty({ example: "colab_clean" })
  theme_id!: string;

  @ApiProperty({ example: "executive" })
  mode!: string;

  @ApiProperty({ example: "draft" })
  status!: string;
}
