import { Module } from "@nestjs/common";
import { PresentationsController } from "./presentations.controller.js";
import { PresentationsService } from "./presentations.service.js";

@Module({
  controllers: [PresentationsController],
  providers: [PresentationsService],
  exports: [PresentationsService],
})
export class PresentationsModule {}
