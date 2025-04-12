import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { IAllExceptionsResponse } from '../interfaces';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    const responseBody: IAllExceptionsResponse = {
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      this.logger.error(`Exception: ${exception.message}, status ${status}`);

      if (typeof response === 'string') {
        responseBody.message = response;
      }

      if (typeof response === 'object' && 'message' in response) {
        responseBody.message = response.message || 'Unknown error';
      }

      responseBody.statusCode = status;

      httpAdapter.reply(ctx.getResponse(), responseBody, status);
    } else {
      this.logger.error(`Exception: ${exception as any}`);

      const httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

      responseBody.message = 'Internal server error :(';
      responseBody.statusCode = httpStatus;

      httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
  }
}
