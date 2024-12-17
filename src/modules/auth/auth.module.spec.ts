import { Test } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt.guard';
import { UsersModule } from '@/modules/users/users.module';

describe('AuthModule', () => {
  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        JWT_SECRET: 'test-secret',
        JWT_EXPIRES_IN: '1h',
      };
      return config[key];
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Module Configuration', () => {
    it('should properly configure imports', async () => {
      const moduleFixture = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
          }),
          AuthModule,
        ],
      })
        .overrideProvider(ConfigService)
        .useValue(mockConfigService)
        .compile();

      const jwtModule = moduleFixture.get(JwtModule);
      const passportModule = moduleFixture.get(PassportModule);
      const usersModule = moduleFixture.get(UsersModule);

      expect(jwtModule).toBeDefined();
      expect(passportModule).toBeDefined();
      expect(usersModule).toBeDefined();
    });

    it('should properly configure providers', async () => {
      const moduleFixture = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
          }),
          AuthModule,
        ],
      })
        .overrideProvider(ConfigService)
        .useValue(mockConfigService)
        .compile();

      const authService = moduleFixture.get(AuthService);
      const localStrategy = moduleFixture.get(LocalStrategy);
      const jwtStrategy = moduleFixture.get(JwtStrategy);
      const jwtAuthGuard = moduleFixture.get(JwtAuthGuard);

      expect(authService).toBeDefined();
      expect(localStrategy).toBeDefined();
      expect(jwtStrategy).toBeDefined();
      expect(jwtAuthGuard).toBeDefined();
    });

    it('should properly configure controllers', async () => {
      const moduleFixture = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
          }),
          AuthModule,
        ],
      })
        .overrideProvider(ConfigService)
        .useValue(mockConfigService)
        .compile();

      const authController = moduleFixture.get(AuthController);
      expect(authController).toBeDefined();
    });

    it('should properly configure JWT with environment variables', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
          }),
          AuthModule,
        ],
      })
        .overrideProvider(ConfigService)
        .useValue(mockConfigService)
        .compile();

      // Initialize the module to trigger the async providers
      await moduleRef.init();

      // Get the JwtModule to verify it was configured
      const jwtModule = moduleRef.get(JwtModule);
      expect(jwtModule).toBeDefined();

      // The ConfigService.get should have been called during module initialization
      const getCalls = mockConfigService.get.mock.calls.map(call => call[0]);
      expect(getCalls).toContain('JWT_SECRET');
      expect(getCalls).toContain('JWT_EXPIRES_IN');

      // Verify the values that were used
      expect(mockConfigService.get('JWT_SECRET')).toBe('test-secret');
      expect(mockConfigService.get('JWT_EXPIRES_IN')).toBe('1h');
    });

    it('should export AuthService and JwtModule', async () => {
      const moduleFixture = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
          }),
          AuthModule,
        ],
      })
        .overrideProvider(ConfigService)
        .useValue(mockConfigService)
        .compile();

      const authService = moduleFixture.get(AuthService);
      const jwtModule = moduleFixture.get(JwtModule);

      expect(authService).toBeDefined();
      expect(jwtModule).toBeDefined();
    });
  });

  describe('Global Guard Configuration', () => {
    it('should configure JwtAuthGuard as a global guard', async () => {
      const moduleFixture = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
          }),
          AuthModule,
        ],
      })
        .overrideProvider(ConfigService)
        .useValue(mockConfigService)
        .compile();

      const providers = Reflect.getMetadata('providers', AuthModule);
      const globalGuardProvider = providers.find(
        (provider: any) => provider.provide === 'APP_GUARD'
      );

      expect(globalGuardProvider).toBeDefined();
      expect(globalGuardProvider.useClass).toBe(JwtAuthGuard);
    });
  });
}); 