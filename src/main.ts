import { NestFactory,Reflector } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ValidationPipe,ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCorsConfig } from '@/config/cors.config';
import { GlobalExceptionFilter } from '@/common/filters/global-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { mkdir } from 'fs/promises';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  const configService = app.get(ConfigService);
  // CORS should be enabled before setting global prefix
  app.enableCors(createCorsConfig(configService));
  
  // Then set global prefix
  app.setGlobalPrefix('api', {
    exclude: ['/public/*']
  });
  
  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // Global filters
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // Ensure uploads directory exists
  const uploadsPath = join(process.cwd(), 'public', 'uploads', 'images');
  await mkdir(uploadsPath, { recursive: true });
  
  // Configure static file serving
  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/public',
    index: false
  });
  
  // Enable class-transformer
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  
  // Optional: Start HTTP server if needed
  const port = configService.get<number>('PORT', 4000);
  await app.listen(port);
  
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();