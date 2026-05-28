import { Module } from "@nestjs/common";
import { StorageModule } from "../storage/storage.module.js";
import { NotebooksController } from "./notebooks.controller.js";
import { NotebookParserService } from "./notebook-parser.service.js";
import { NotebookUploadsService } from "./notebook-uploads.service.js";
import { NotebookValidationService } from "./notebook-validation.service.js";
import { NotebooksService } from "./notebooks.service.js";

@Module({
  imports: [StorageModule],
  controllers: [NotebooksController],
  providers: [
    NotebooksService,
    NotebookUploadsService,
    NotebookValidationService,
    NotebookParserService,
  ],
  exports: [
    NotebooksService,
    NotebookUploadsService,
    NotebookValidationService,
    NotebookParserService,
  ],
})
export class NotebooksModule {}
