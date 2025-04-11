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

      this.logger.error(`Exception: ${exception.message}, status ${status}`);

      responseBody.message = exception.message;
      responseBody.status = status;

      httpAdapter.reply(ctx.getResponse(), responseBody, status);
    } else {
      this.logger.error(`Exception: ${exception as any}`);

      const httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

      responseBody.message = 'Internal server error :(';
      responseBody.status = httpStatus;

      httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
  }
}
