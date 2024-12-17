import { HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@/common/interfaces/api-response.interface';

export class ApiResponseUtil {
    static success<T>(
        data: T,
        message: string,
        path: string,
        statusCode: HttpStatus = HttpStatus.OK,
    ): ApiResponse<T> {
        return {
            success: true,
            statusCode,
            message,
            path,
            timestamp: new Date().toISOString(),
            data,
        };
    }

    static error(
        message: string,
        path: string,
        statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    ): ApiResponse<void> {
        return {
            success: false,
            statusCode,
            message,
            path,
            timestamp: new Date().toISOString(),
            data: undefined,
        };
    }
} 