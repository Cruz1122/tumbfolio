import { Module } from "@nestjs/common";
import { SlidesController } from "./slides.controller.js";

@Module({
  controllers: [SlidesController]
})
export class SlidesModule {}
