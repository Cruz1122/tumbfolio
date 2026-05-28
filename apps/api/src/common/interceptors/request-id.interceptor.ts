import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor} from "@nestjs/common";
import {
  Injectable
} from "@nestjs/common";
import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import type { Observable } from "rxjs";
import { REQUEST_ID_HEADER } from "../constants/api.constants.js";

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const incomingRequestId = request.header(REQUEST_ID_HEADER);
    const requestId = incomingRequestId?.trim() || randomUUID();

    request.requestId = requestId;
    request.startedAt = Date.now();

    response.setHeader(REQUEST_ID_HEADER, requestId);

    return next.handle();
  }
}
