import { Module } from "@nestjs/common";
import { NbxpController } from "./nbxp.controller.js";
import { NbxpService } from "./nbxp.service.js";

@Module({
  controllers: [NbxpController],
  providers: [NbxpService],
  exports: [NbxpService],
})
export class NbxpModule {}
