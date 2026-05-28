import { Type, Transform } from "class-transformer";
import {
  IsBoolean,
  IsInt,
  IsOptional,
  Max,
  Min,
} from "class-validator";
import {
  ApiProperty,
  ApiPropertyOptional,
} from "@nestjs/swagger";

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

export class ParseNotebookQueryDto {
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  force: boolean = false;
}

export class ParseNotebookResponseDto {
  @ApiProperty({ format: "uuid" })
  source_notebook_id!: string;

  @ApiProperty({ example: 3 })
  cell_count!: number;

  @ApiProperty({ example: 5 })
  output_count!: number;

  @ApiProperty({ example: 2 })
  asset_count!: number;

  @ApiProperty({ example: "processed" })
  processing_status!: string;
}

export class GetNotebookCellsQueryDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? true : value === true || value === "true",
  )
  @IsBoolean()
  include_outputs: boolean = true;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  include_asset_urls: boolean = false;

  @ApiPropertyOptional({ default: 1000, minimum: 50, maximum: 4000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(50)
  @Max(4000)
  preview_chars: number = 1000;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  page_size?: number;
}

export class NotebookCellAssetRefDto {
  @ApiProperty({ format: "uuid" })
  asset_id!: string;

  @ApiProperty({ example: "image" })
  kind!: "image" | "html" | "json" | "text" | "binary";

  @ApiProperty({ example: "image/png" })
  mime_type!: string;

  @ApiPropertyOptional({ example: "plot.png" })
  filename?: string | null;

  @ApiPropertyOptional({ example: 184203 })
  size_bytes?: number;

  @ApiPropertyOptional({ example: "a3b0..." })
  checksum_sha256?: string | null;

  @ApiProperty({ nullable: true, example: null })
  download_url!: string | null;

  @ApiPropertyOptional({ nullable: true, example: null })
  download_url_expires_at?: string | null;
}

export class NotebookOutputErrorDto {
  @ApiPropertyOptional({ example: "ValueError" })
  ename?: string;

  @ApiPropertyOptional({ example: "boom" })
  evalue?: string;
}

export class NotebookOutputSummaryDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ example: 0 })
  output_index!: number;

  @ApiProperty({ example: "display_data" })
  output_type!:
    | "execute_result"
    | "display_data"
    | "stream"
    | "error"
    | "unknown";

  @ApiPropertyOptional({ example: "text/html" })
  mime_type?: string;

  @ApiProperty({ example: "html" })
  render_strategy!:
    | "plain_text"
    | "html"
    | "image"
    | "svg"
    | "stream"
    | "error"
    | "json"
    | "unsupported";

  @ApiProperty({ example: 80 })
  priority!: number;

  @ApiProperty({ example: false })
  is_noise!: boolean;

  @ApiPropertyOptional({ example: "<table>...</table>" })
  text_preview?: string;

  @ApiProperty({ example: true })
  truncated!: boolean;

  @ApiPropertyOptional({ type: NotebookCellAssetRefDto })
  asset?: NotebookCellAssetRefDto;

  @ApiPropertyOptional({ type: NotebookOutputErrorDto })
  error?: NotebookOutputErrorDto;
}

export class NotebookCellDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ example: 0 })
  cell_index!: number;

  @ApiProperty({ example: "code" })
  cell_type!: "markdown" | "code" | "raw" | "unknown";

  @ApiProperty()
  source!: string;

  @ApiProperty()
  source_preview!: string;

  @ApiPropertyOptional({ nullable: true, example: 4 })
  execution_count?: number | null;

  @ApiProperty({ example: "unclassified" })
  classification!: string;

  @ApiProperty({ example: false })
  is_noise!: boolean;

  @ApiPropertyOptional()
  metadata?: Record<string, unknown>;

  @ApiProperty({ type: [NotebookOutputSummaryDto] })
  outputs!: NotebookOutputSummaryDto[];
}

export class NotebookCellsResponseDto {
  @ApiProperty({ format: "uuid" })
  source_notebook_id!: string;

  @ApiProperty({ type: [NotebookCellDto] })
  cells!: NotebookCellDto[];
}
