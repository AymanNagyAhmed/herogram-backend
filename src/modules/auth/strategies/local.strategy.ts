import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '@/modules/auth/auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '@/modules/auth/dto/login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const loginDto: LoginDto = { email, password };
    const token = await this.authService.validateUser(loginDto);
    if (!token) {
      throw new UnauthorizedException();
    }
    return token;
  }
}