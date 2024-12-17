import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/modules/users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import * as bcryptjs from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword123',
    fullName: 'Test User',
    dateOfBirth: new Date('1990-01-01'),
    resumeSummary: 'Test summary',
    createdAt: new Date(),
    updatedAt: new Date(),
    preferredLocation: {
      id: 1,
      locationName: 'Test Location',
    },
    programmingSkills: [
      {
        userId: 1,
        programmingSkillId: 1,
        assignedAt: new Date(),
        programmingSkill: {
          id: 1,
          name: 'JavaScript',
        },
      },
    ],
  };

  const mockLoginDto: LoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockJwtToken = 'mock-jwt-token';

  const mockUsersService = {
    findUserByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should successfully validate user and return auth response', async () => {
      // Arrange
      mockUsersService.findUserByEmail.mockResolvedValue(mockUser);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(mockJwtToken);

      // Act
      const result = await service.validateUser(mockLoginDto);

      // Assert
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          fullName: mockUser.fullName,
          dateOfBirth: mockUser.dateOfBirth,
          preferredLocation: mockUser.preferredLocation,
          resumeSummary: mockUser.resumeSummary,
          programmingSkills: [
            {
              id: mockUser.programmingSkills[0].programmingSkill.id,
              name: mockUser.programmingSkills[0].programmingSkill.name,
            },
          ],
        },
        access_token: mockJwtToken,
      });

      expect(usersService.findUserByEmail).toHaveBeenCalledWith(
        mockLoginDto.email,
        expect.any(Object)
      );
      expect(bcryptjs.compare).toHaveBeenCalledWith(
        mockLoginDto.password,
        mockUser.password
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      mockUsersService.findUserByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.validateUser(mockLoginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials')
      );
      expect(usersService.findUserByEmail).toHaveBeenCalledWith(
        mockLoginDto.email,
        expect.any(Object)
      );
      expect(bcryptjs.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      mockUsersService.findUserByEmail.mockResolvedValue(mockUser);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.validateUser(mockLoginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials')
      );
      expect(usersService.findUserByEmail).toHaveBeenCalledWith(
        mockLoginDto.email,
        expect.any(Object)
      );
      expect(bcryptjs.compare).toHaveBeenCalledWith(
        mockLoginDto.password,
        mockUser.password
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should include correct include options when querying user', async () => {
      // Arrange
      mockUsersService.findUserByEmail.mockResolvedValue(mockUser);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(mockJwtToken);

      const expectedIncludeOptions = {
        preferredLocation: {
          select: {
            id: true,
            locationName: true,
          },
        },
        programmingSkills: {
          include: {
            programmingSkill: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      };

      // Act
      await service.validateUser(mockLoginDto);

      // Assert
      expect(usersService.findUserByEmail).toHaveBeenCalledWith(
        mockLoginDto.email,
        expectedIncludeOptions
      );
    });
  });
});
