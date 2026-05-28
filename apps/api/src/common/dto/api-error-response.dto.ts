import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ApiErrorResponseDto {
  @ApiProperty({ example: "VALIDATION_FAILED" })
  error_code!: string;

  @ApiProperty({ example: "Request validation failed." })
  message!: string;

  @ApiPropertyOptional({
    example: [{ field: "name", messages: ["name must be a string"] }],
  })
  details?: unknown;

  @ApiProperty({ example: "/api/projects" })
  path!: string;

  @ApiProperty({ example: "POST" })
  method!: string;

  @ApiProperty({ example: "9f2d2ef8-b4c3-4d67-a6fd-13ef3e1a86cc" })
  request_id!: string;

  @ApiProperty({ example: "2026-05-28T18:00:00.000Z" })
  timestamp!: string;
}
