import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DevicesRepository } from '../infrastructure/repositories/devices/devices.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from '../entities/devices/device.entity';
import { DevicesQueryRepository } from '../infrastructure/repositories/devices/devices-query.repository';
import { DataSourceRepository } from '../infrastructure/repositories/transactions/data-source.repository';
import { DevicesController } from '../controllers/public/devices.controller';
import { DeleteDeviceUseCase } from '../domain/devices/use-cases/delete-device-use-case';
import { UsersTransactionRepository } from '../infrastructure/repositories/users/users.transaction.repository';
import { DevicesTransactionsRepository } from '../infrastructure/repositories/devices/devices-transactions.repository';
import { RefreshTokenMiddleware } from '../middlewares/refresh-token.middleware';
import { JwtService } from '@nestjs/jwt';

const repositories = [
  DevicesRepository,
  DevicesQueryRepository,
  DataSourceRepository,
  UsersTransactionRepository,
  DevicesTransactionsRepository,
  RefreshTokenMiddleware,
];

@Module({
  imports: [TypeOrmModule.forFeature([Device]), CqrsModule],
  controllers: [DevicesController],
  providers: [
    JwtService,
    DeleteDeviceUseCase,
    RefreshTokenMiddleware,
    ...repositories,
  ],
  exports: [TypeOrmModule],
})
export class DevicesModule {}
