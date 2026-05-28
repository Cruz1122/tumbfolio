import type { NotebookSummaryDto } from "./dto/notebook.dto.js";
import { Injectable } from "@nestjs/common";
import type { NotebookValidationService } from "./notebook-validation.service.js";

@Injectable()
export class NotebooksService {
  constructor(
    private readonly notebookValidationService: NotebookValidationService,
  ) {}

  getSummary(notebookId: string): Promise<NotebookSummaryDto> {
    return this.notebookValidationService.getSummary(notebookId);
  }
}
