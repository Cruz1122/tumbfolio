import { Module } from "@nestjs/common";
import { NotebooksController } from "./notebooks.controller.js";

@Module({
  controllers: [NotebooksController]
})
export class NotebooksModule {}
