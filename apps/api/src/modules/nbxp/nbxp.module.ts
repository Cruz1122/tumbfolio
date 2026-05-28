import { Module } from "@nestjs/common";
import { NbxpController } from "./nbxp.controller.js";

@Module({
  controllers: [NbxpController]
})
export class NbxpModule {}
