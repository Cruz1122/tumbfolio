import type { ArgumentsHost, ExceptionFilter} from "@nestjs/common";
import { Catch, HttpException, HttpStatus } from "@nestjs/common";
import type { Response } from "express";

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = exception instanceof HttpException ? exception.getResponse() : undefined;

    response.status(status).json({
      errorCode: status === HttpStatus.INTERNAL_SERVER_ERROR ? "INTERNAL_SERVER_ERROR" : "REQUEST_FAILED",
      message: typeof payload === "object" && payload && "message" in payload ? payload.message : "Request failed",
      statusCode: status,
      timestamp: new Date().toISOString()
    });
  }
}
