import { Module,NestModule, MiddlewareConsumer } from '@nestjs/common';
import { validationSchema } from '@/config/env.validation';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '@/modules/users/users.module';
import { User } from '@/modules/users/entities/user.entity';
import { Media } from '@/modules/media/entities/media.entity';
import { Tag } from '@/modules/tags/entities/tag.entity';
import { AuthModule } from '@/modules/auth/auth.module';
import { MediaModule } from './modules/media/media.module';
import { TagsModule } from './modules/tags/tags.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', '127.0.0.1'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USER', 'admin'),
        password: configService.get<string>('DB_PASSWORD', '@12345Admin'),
        database: configService.get<string>('DB_NAME', 'starter_db'),
        entities: [
          User,
          Tag,
          Media,
        ],
        synchronize: configService.get<string>('NODE_ENV') === 'development',
        logging: true,
        migrationsRun: true,
        migrationsTransactionMode: 'each',
      }),
    }),
    UsersModule,
    TagsModule,
    MediaModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

