import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString, Matches, Max, Min } from "class-validator";

export class CompleteNotebookUploadDto {
  @ApiProperty({
    example: "notebooks/local-user/123e4567-e89b-12d3-a456-426614174000/source.ipynb",
  })
  @IsString()
  storage_key!: string;

  @ApiProperty({ example: "analysis.ipynb" })
  @IsString()
  @Matches(/\.ipynb$/i, { message: "Only .ipynb files are supported." })
  original_filename!: string;

  @ApiProperty({ example: 4_200_000 })
  @IsInt()
  @Min(1)
  @Max(50 * 1024 * 1024)
  file_size_bytes!: number;

  @ApiProperty({
    example:
      "8a1f4d7d8b6f2d7f33a2f0c6a7f9d9c1e3f6a0e6f1a9b0c2d3e4f5a6b7c8d9e0f",
  })
  @IsString()
  @Matches(/^[a-f0-9]{64}$/i)
  sha256!: string;
}

export class CompleteNotebookUploadResponseDto {
  @ApiProperty({ format: "uuid" })
  project_id!: string;

  @ApiProperty({ format: "uuid" })
  source_notebook_id!: string;

  @ApiProperty({ example: "pending" })
  validation_status!: string;

  @ApiProperty({ example: "idle" })
  processing_status!: string;
}
