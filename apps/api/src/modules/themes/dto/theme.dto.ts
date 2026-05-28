import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ThemeDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ example: "Colab Clean" })
  name!: string;

  @ApiProperty({ example: "colab_clean" })
  slug!: string;

  @ApiPropertyOptional({ example: "Default clean notebook-like theme." })
  description?: string;

  @ApiProperty({ example: true })
  is_system!: boolean;
}
