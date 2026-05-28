import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SlideDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ format: "uuid" })
  presentation_id!: string;

  @ApiProperty({ example: 1 })
  slide_order!: number;

  @ApiPropertyOptional({ example: "Model performance overview" })
  title?: string;

  @ApiProperty({ example: "figure_focus" })
  layout!: string;

  @ApiProperty({ example: "normal" })
  status!: string;
}
