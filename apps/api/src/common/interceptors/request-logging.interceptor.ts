import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor} from "@nestjs/common";
import {
  Injectable,
  Logger
} from "@nestjs/common";
import type { Request, Response } from "express";
import type { Observable } from "rxjs";
import { catchError, tap, throwError } from "rxjs";

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - (request.startedAt ?? Date.now());

        this.logger.log({
          requestId: request.requestId,
          method: request.method,
          path: request.url,
          statusCode: response.statusCode,
          durationMs,
        });
      }),
      catchError((error: unknown) => {
        const durationMs = Date.now() - (request.startedAt ?? Date.now());

        this.logger.error({
          requestId: request.requestId,
          method: request.method,
          path: request.url,
          statusCode: response.statusCode,
          durationMs,
        });

        return throwError(() => error);
      }),
    );
  }
}
