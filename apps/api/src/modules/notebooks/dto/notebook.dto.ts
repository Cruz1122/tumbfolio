import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SourceNotebookDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ format: "uuid" })
  project_id!: string;

  @ApiProperty({ example: "churn-analysis.ipynb" })
  original_filename!: string;

  @ApiProperty({ example: "uploaded" })
  processing_status!: string;

  @ApiProperty({ example: "pending" })
  validation_status!: string;

  @ApiPropertyOptional({ example: 42 })
  cell_count?: number;

  @ApiPropertyOptional({ example: 18 })
  output_count?: number;

  @ApiPropertyOptional({ example: ["image/png", "text/html"] })
  detected_mime_types?: string[];
}

export class NotebookSummaryDto extends SourceNotebookDto {
  @ApiPropertyOptional({ example: [] })
  validation_errors?: unknown[];

  @ApiPropertyOptional({ example: [] })
  validation_warnings?: unknown[];
}
