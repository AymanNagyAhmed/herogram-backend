import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/modules/users/users.service';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { AuthResponse, AuthUserData } from '@/modules/auth/interfaces/auth-response.interface';
import * as bcryptjs from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
      select: ['id', 'email', 'password', 'name', 'status', 'profileImage']
    });
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcryptjs.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      sub: user.id, 
      email: user.email,
      name: user.name,
    };

    // Create a user object without the password
    const { password: _, ...userData } = user;
    
    // Transform to AuthUserData
    const transformedUser: AuthUserData = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      status: userData.status,
      profileImage: userData.profileImage,
    };

    return {
      user: transformedUser,
      access_token: this.jwtService.sign(payload),
    };
  }
}