import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { getWorkerEnv } from "@tumbfolio/config";
import { WorkerModule } from "./worker.module.js";

async function bootstrap() {
  const env = getWorkerEnv();
  const app = await NestFactory.createApplicationContext(WorkerModule, { bufferLogs: true });

  app.enableShutdownHooks();

  console.log(
    `Tumbfolio worker started. queuesEnabled=${env.WORKER_QUEUES_ENABLED ? "true" : "false"}`
  );
}

void bootstrap();
