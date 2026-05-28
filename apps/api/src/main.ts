import "reflect-metadata";
import compression from "compression";
import { json, urlencoded } from "express";
import helmet from "helmet";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { loadApiEnv } from "@tumbfolio/config";
import { AppModule } from "./app.module.js";
import { ApiExceptionFilter } from "./common/filters/api-exception.filter.js";
import { RequestIdInterceptor } from "./common/interceptors/request-id.interceptor.js";

async function bootstrap() {
  const env = loadApiEnv();
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.setGlobalPrefix("api");
  app.enableCors({ origin: env.WEB_ORIGIN, credentials: true });
  app.use(helmet());
  app.use(compression());
  app.use(json({ limit: "10mb" }));
  app.use(urlencoded({ extended: true, limit: "10mb" }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalInterceptors(new RequestIdInterceptor());

  const config = new DocumentBuilder()
    .setTitle("Tumbfolio API")
    .setDescription("Internal API for projects, notebooks, presentations and exports.")
    .setVersion("0.0.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(env.API_PORT);
  console.log(`Tumbfolio API listening on http://localhost:${env.API_PORT}/api`);
}

void bootstrap();
