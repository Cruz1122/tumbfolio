import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ProjectDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ example: "Customer churn analysis" })
  name!: string;

  @ApiProperty({ example: "active" })
  status!: string;

  @ApiProperty({ example: "2026-05-28T18:00:00.000Z" })
  created_at!: string;

  @ApiProperty({ example: "2026-05-28T18:00:00.000Z" })
  updated_at!: string;
}

export class ProjectListResponseDto {
  @ApiProperty({ type: [ProjectDto] })
  items!: ProjectDto[];

  @ApiProperty({ example: 0 })
  total!: number;
}

export class ProjectDetailDto extends ProjectDto {
  @ApiPropertyOptional({ example: 3 })
  notebook_count?: number;

  @ApiPropertyOptional({ example: 2 })
  presentation_count?: number;
}
