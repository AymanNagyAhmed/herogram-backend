import { Controller, Post, Body, Get, UseGuards, Req, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { AuthService } from '@/modules/auth/auth.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guard';
import { AuthResponse } from '@/modules/auth/interfaces/auth-response.interface';
import { Public } from '@/common/decorators/public.decorator';
import { ApiResponseInterceptor } from '@/common/interceptors/api-response.interceptor';

@Controller('auth')
@UseInterceptors(ApiResponseInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return await this.authService.validateUser(loginDto);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  getStatus(@Req() req: Request & { user?: any }) {
    return req.user;
  }
}