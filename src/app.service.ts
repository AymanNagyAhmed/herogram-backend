import { Injectable, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiResponse } from '@/common/interfaces/api-response.interface';

@Injectable()
export class AppService {
  async getHello(): Promise<ApiResponse<{ message: string }>> {
    try {
      const someCondition = false;
      if (someCondition) {
        throw new BadRequestException('Custom error message');
      }
      
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Users microservice is running',
        path: '/',
        timestamp: new Date().toISOString(),
        data: { message: 'starter-project' }
      };
    } catch (error) {
      throw new BadRequestException('Failed to process request');
    }
  }
}
