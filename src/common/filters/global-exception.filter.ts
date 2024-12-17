import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '@/common/interfaces/api-response.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors: Record<string, any> | undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse() as any;

            // If it's already in our API response format, use it directly
            if (exceptionResponse.success !== undefined) {
                const errorResponse = {
                    ...exceptionResponse,
                    path: request.url,
                };
                return response.status(status).json(errorResponse);
            }

            // Otherwise, format the error
            message = exceptionResponse.message || message;
            errors = exceptionResponse.errors;
        }

        this.logger.error(
            `${request.method} ${request.url} ${status} - ${message}`,
            exception instanceof Error ? exception.stack : undefined,
        );

        const errorResponse: ApiResponse<null> = {
            success: false,
            statusCode: status,
            message,
            path: request.url,
            timestamp: new Date().toISOString(),
            data: null,
            ...(errors && { errors }),
        };

        response.status(status).json(errorResponse);
    }
} 