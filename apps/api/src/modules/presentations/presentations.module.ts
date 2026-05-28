import { Module } from "@nestjs/common";
import { PresentationsController } from "./presentations.controller.js";

@Module({
  controllers: [PresentationsController]
})
export class PresentationsModule {}
