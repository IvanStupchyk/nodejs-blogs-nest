import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { User } from '../entities/users/user.entity';
import { UsersQueryRepository } from '../infrastructure/repositories/users/users-query.repository';
import { UsersRepository } from '../infrastructure/repositories/users/users.repository';
import { UserBanByBlogger } from '../entities/users/User-ban-by-blogger.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsRepository } from '../infrastructure/repositories/transactions/transactions.repository';
import { DevicesTransactionsRepository } from '../infrastructure/repositories/devices/devices-transactions.repository';
import { IsEmailExistConstraint } from '../utils/decorators/unique-email.decorator';
import { IsLoginExistConstraint } from '../utils/decorators/unique-login.decorator';
import { UserBanInfo } from '../entities/users/User-ban-info.entity';
import { InvalidRefreshToken } from '../entities/users/Invalid-refresh-tokens.entity';
import { UsersTransactionRepository } from '../infrastructure/repositories/users/users.transaction.repository';
import { UsersSaController } from '../controllers/super-admin/users.sa.controller';
import { DevicesModule } from './devices.module';
import { CreateSuperUserUseCase } from '../domain/users/use-cases/create-super-user-use-case';
import { DeleteUserUseCase } from '../domain/users/use-cases/delete-user-use-case';
import { BanUserUseCase } from '../domain/users/use-cases/ban-user-use-case';
import { CreateCommonUserUseCase } from '../domain/auth/use-cases/create-common-user-use-case';
import { GetCurrentUserUseCase } from '../domain/auth/use-cases/get-current-user-use-case';
import { Device } from '../entities/devices/Device.entity';

const useCases = [
  CreateSuperUserUseCase,
  DeleteUserUseCase,
  BanUserUseCase,
  CreateCommonUserUseCase,
  GetCurrentUserUseCase,
];

const entities = [
  User,
  Device,
  UserBanByBlogger,
  InvalidRefreshToken,
  UserBanInfo,
  UserBanByBlogger,
];

const repositories = [
  UsersRepository,
  UsersQueryRepository,
  UsersTransactionRepository,
  DevicesTransactionsRepository,
  TransactionsRepository,
];

@Module({
  imports: [TypeOrmModule.forFeature([...entities]), DevicesModule, CqrsModule],
  controllers: [UsersSaController],
  providers: [
    ...useCases,
    ...repositories,
    IsLoginExistConstraint,
    IsEmailExistConstraint,
  ],
  exports: [TypeOrmModule],
})
export class UsersModule {}
