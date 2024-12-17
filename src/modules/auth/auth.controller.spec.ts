import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import { UnauthorizedException } from '@nestjs/common';
import { ApiResponseInterceptor } from '@/common/interceptors/api-response.interceptor';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  const mockLoginDto: LoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockAuthResponse: AuthResponse = {
    user: {
      id: 1,
      email: 'test@example.com',
      fullName: 'Test User',
      dateOfBirth: new Date('1990-01-01'),
      preferredLocation: {
        id: 1,
        locationName: 'Test Location',
      },
      resumeSummary: 'Test summary',
      programmingSkills: [
        { id: 1, name: 'JavaScript' },
      ],
    },
    access_token: 'mock-jwt-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        ApiResponseInterceptor,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login and return auth response', async () => {
      // Arrange
      mockAuthService.validateUser.mockResolvedValue(mockAuthResponse);

      // Act
      const result = await controller.login(mockLoginDto);

      // Assert
      expect(result).toBe(mockAuthResponse);
      expect(authService.validateUser).toHaveBeenCalledWith(mockLoginDto);
      expect(authService.validateUser).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException when login fails', async () => {
      // Arrange
      mockAuthService.validateUser.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      // Act & Assert
      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.validateUser).toHaveBeenCalledWith(mockLoginDto);
    });
  });

  describe('getStatus', () => {
    it('should return user data from request', () => {
      // Arrange
      const mockRequest = {
        user: {
          id: 1,
          email: 'test@example.com',
          fullName: 'Test User',
        },
      };

      // Act
      const result = controller.getStatus(mockRequest as any);

      // Assert
      expect(result).toBe(mockRequest.user);
    });
  });
});
