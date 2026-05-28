import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "../constants/api.constants.js";

export class PageQueryDto {
  @ApiPropertyOptional({ example: DEFAULT_PAGE, default: DEFAULT_PAGE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = DEFAULT_PAGE;

  @ApiPropertyOptional({
    example: DEFAULT_PAGE_SIZE,
    default: DEFAULT_PAGE_SIZE,
    maximum: MAX_PAGE_SIZE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  page_size: number = DEFAULT_PAGE_SIZE;
}
