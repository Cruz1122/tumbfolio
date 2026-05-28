import { IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ProjectIdParamDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  projectId!: string;
}

export class NotebookIdParamDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  notebookId!: string;
}

export class PresentationIdParamDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  presentationId!: string;
}

export class SlideIdParamDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  slideId!: string;
}

export class AssetIdParamDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  assetId!: string;
}

export class ExportJobIdParamDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  exportJobId!: string;
}

export class ShareLinkIdParamDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  shareLinkId!: string;
}
