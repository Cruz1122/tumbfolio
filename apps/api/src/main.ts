import "reflect-metadata";
import compression from "compression";
import helmet from "helmet";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { loadApiEnv } from "@tumbfolio/config";
import { AppModule } from "./app.module.js";
import {
  API_DOCS_PATH,
  API_PREFIX,
} from "./common/constants/api.constants.js";
import { ApiExceptionFilter } from "./common/errors/api-exception.filter.js";
import { RequestIdInterceptor } from "./common/interceptors/request-id.interceptor.js";
import { RequestLoggingInterceptor } from "./common/interceptors/request-logging.interceptor.js";
import { validationExceptionFactory } from "./common/validation/validation-exception.factory.js";

async function bootstrap() {
  const env = loadApiEnv();
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(API_PREFIX);

  app.enableCors({
    origin: env.WEB_ORIGIN,
    credentials: true,
  });

  app.use(helmet());
  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: validationExceptionFactory,
    }),
  );

  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalInterceptors(
    new RequestIdInterceptor(),
    new RequestLoggingInterceptor(),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Tumbfolio API")
    .setDescription(
      "NestJS HTTP API for projects, notebooks, presentations, slides, assets, themes, exports, NBXP, AI suggestions and sharing.",
    )
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(API_DOCS_PATH, app, swaggerDocument);

  await app.listen(env.API_PORT);
}

void bootstrap();
