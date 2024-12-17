import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseUtil } from '@/common/utils/api-response.util';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const path = request.path;

    return next.handle().pipe(
      map(data => {
        // If the response is already formatted, return it as is
        if (data?.success !== undefined) {
          return data;
        }

        // Otherwise, format it using ApiResponseUtil
        return ApiResponseUtil.success(
          data,
          'Operation successful',
          path
        );
      }),
    );
  }
} 