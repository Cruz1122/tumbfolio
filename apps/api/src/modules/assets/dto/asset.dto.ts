import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AssetDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ format: "uuid" })
  project_id!: string;

  @ApiProperty({ example: "image/png" })
  media_type!: string;

  @ApiProperty({ example: "notebook_output_image" })
  asset_type!: string;

  @ApiPropertyOptional({ example: 123456 })
  size_bytes?: number;

  @ApiPropertyOptional({ example: "a3b0..." })
  sha256?: string;
}

export class AssetDownloadUrlDto {
  @ApiProperty({ example: "https://storage.example.com/signed-url" })
  url!: string;

  @ApiProperty({ example: 600 })
  expires_in_seconds!: number;
}
