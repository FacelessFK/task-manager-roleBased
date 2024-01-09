import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerFilter } from './common/filters/throttlerExeptionFilter/throttlerExeptionFilter';
import { Users } from './users/schema/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DATABASE_HOST'),
        port: +configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [Users],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    ThrottlerModule.forRoot([
      {
        ttl: 5000,
        limit: 3,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    {
      provide: APP_FILTER,
      useClass: ThrottlerFilter,
    },
  ],
})
export class AppModule {}
