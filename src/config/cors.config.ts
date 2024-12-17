import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';

export const createCorsConfig = (configService: ConfigService): CorsOptions => ({
  origin: (origin, callback) => {
    const isDevelopment = configService.get<string>('NODE_ENV') === 'development';
    if (isDevelopment && !origin) {
      callback(null, true);
      return;
    }
    const allowedOrigins = configService.get<string>('CORS_ORIGINS', 'http://localhost:3000').split(',');
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: configService.get<string>('CORS_METHODS', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS').split(','),
  credentials: configService.get<boolean>('CORS_CREDENTIALS', true),
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: [
    'Accept',
    'Authorization',
    'Content-Type',
    'X-Requested-With',
    'Range',
    'Origin',
    'Content-Disposition',
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'Content-Disposition',
  ],
  maxAge: 3600,
}); 