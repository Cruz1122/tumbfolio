import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsUUID } from "class-validator";

export class CreateNbxpExportDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  presentation_id!: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  embed_source_notebook!: boolean;
}

export class NbxpExportDto {
  @ApiProperty({ format: "uuid" })
  export_job_id!: string;
}
