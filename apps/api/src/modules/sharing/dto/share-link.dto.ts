import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ShareLinkDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ format: "uuid" })
  presentation_id!: string;

  @ApiProperty({ example: "view_only" })
  permission!: string;

  @ApiProperty({ example: true })
  is_active!: boolean;

  @ApiPropertyOptional({ example: "2026-06-28T18:00:00.000Z" })
  expires_at?: string;
}
