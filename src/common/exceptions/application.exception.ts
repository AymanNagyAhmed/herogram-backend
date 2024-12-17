import { HttpException, HttpStatus } from '@nestjs/common';

interface ErrorDetail {
  message: string;
  path?: string;
  timestamp?: string;
}

export class ApplicationException extends HttpException {
  constructor(
    message: string, 
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    path: string = '',
    errors: ErrorDetail[] = []
  ) {
    super(
      {
        success: false,
        statusCode: status,
        message,
        path,
        timestamp: new Date().toISOString(),
        data: undefined,
        errors: errors.length > 0 ? errors : [
          {
            message: message,
            path,
            timestamp: new Date().toISOString(),
          }
        ]
      },
      status,
    );
  }
} 