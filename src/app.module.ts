import { ConfigModule } from '@nestjs/config';
const configModule = ConfigModule.forRoot();

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { globalBdOptions, localBdOptions } from './constants/db-options';
import { ScheduleModule } from '@nestjs/schedule';
import { TelegramModule } from './modules/telegram.module';
import { GameModule } from './modules/game.module';
import { UsersModule } from './modules/users.module';
import { DevicesModule } from './modules/devices.module';
import { AuthModule } from './modules/auth.module';
import { MainModule } from './modules/main.module';

@Module({
  imports: [
    CqrsModule,
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5000,
      },
    ]),
    configModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(localBdOptions),
    TelegramModule,
    GameModule,
    UsersModule,
    DevicesModule,
    AuthModule,
    MainModule,
  ],
})
export class AppModule {}
