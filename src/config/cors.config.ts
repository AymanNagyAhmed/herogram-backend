import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';

export const createCorsConfig = (configService: ConfigService): CorsOptions => ({
  origin: (origin, callback) => {
    const isDevelopment = configService.get<string>('NODE_ENV') === 'development';
    if (!origin) {
      callback(null, true);
      return;
    }

    const allowedOrigins = configService
      .get<string>('CORS_ORIGINS', 'http://localhost:3000')
      .split(',')
      .map(o => o.trim());

    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: configService
    .get<string>('CORS_METHODS', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
    .split(',')
    .map(method => method.trim()),
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: [
    'Accept',
    'Authorization',
    'Content-Type',
    'X-Requested-With',
    'Range',
    'Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials',
    'Content-Disposition',
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'Content-Disposition',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials',
  ],
  maxAge: 3600,
}); 