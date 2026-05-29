import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ApiErrorResponseDto {
  @ApiProperty({ type: String, example: "VALIDATION_FAILED" })
  error_code!: string;

  @ApiProperty({ type: String, example: "Request validation failed." })
  message!: string;

  @ApiPropertyOptional({
    type: Object,
    example: [{ field: "name", messages: ["name must be a string"] }],
  })
  details?: unknown;

  @ApiProperty({ type: String, example: "/api/projects" })
  path!: string;

  @ApiProperty({ type: String, example: "POST" })
  method!: string;

  @ApiProperty({ type: String, example: "9f2d2ef8-b4c3-4d67-a6fd-13ef3e1a86cc" })
  request_id!: string;

  @ApiProperty({ type: String, example: "2026-05-28T18:00:00.000Z" })
  timestamp!: string;
}
