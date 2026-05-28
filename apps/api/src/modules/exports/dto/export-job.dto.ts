import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ExportJobDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ format: "uuid" })
  presentation_id!: string;

  @ApiProperty({ example: "pdf" })
  export_type!: string;

  @ApiProperty({ example: "queued" })
  status!: string;

  @ApiPropertyOptional({ format: "uuid" })
  result_asset_id?: string;

  @ApiPropertyOptional({ example: "PDF_RENDER_TIMEOUT" })
  error_code?: string;
}
