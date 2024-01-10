import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersRepository } from '../infrastructure/repositories/users/users.repository';
import { DevicesRepository } from '../infrastructure/repositories/devices/devices.repository';
import { LocalStrategy } from '../auth/strategies/local.strategy';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { BasicStrategy } from '../auth/strategies/basic.strategy';
import { TransactionsRepository } from '../infrastructure/repositories/transactions/transactions.repository';
import { DataSourceRepository } from '../infrastructure/repositories/transactions/data-source.repository';
import { UsersTransactionRepository } from '../infrastructure/repositories/users/users.transaction.repository';
import { DevicesQueryRepository } from '../infrastructure/repositories/devices/devices-query.repository';
import { ResendEmailConfirmationCodeUseCase } from '../domain/auth/use-cases/resend-email-confirmation-code-use-case';
import { SendRecoveryPasswordCodeUseCase } from '../domain/auth/use-cases/send-recovery-password-code-use-case';
import { ConfirmEmailUseCase } from '../domain/auth/use-cases/confirm-email-use-case';
import { LogInUserUseCase } from '../domain/auth/use-cases/log-in-user-use-case';
import { LogOutUserUseCase } from '../domain/auth/use-cases/log-out-user-use-case';
import { ValidateUserUseCase } from '../domain/auth/use-cases/validate-user-use-case';
import { RefreshTokenUseCase } from '../domain/auth/use-cases/refresh-token-use-case';
import { UpdateUserPasswordUseCase } from '../domain/auth/use-cases/update-user-password-use-case';
import { AuthController } from '../controllers/public/auth.controller';
import { DevicesTransactionsRepository } from '../infrastructure/repositories/devices/devices-transactions.repository';
import { InvalidRefreshTokensTransactionsRepository } from '../infrastructure/repositories/users/invalid-refresh-tokens-transactions.repository';
import { UsersQueryRepository } from '../infrastructure/repositories/users/users-query.repository';
import { DevicesModule } from './devices.module';
import { UsersModule } from './users.module';
import { RefreshTokenMiddleware } from '../middlewares/refresh-token.middleware';
import { JwtService } from '@nestjs/jwt';

const useCases = [
  RefreshTokenUseCase,
  ConfirmEmailUseCase,
  ResendEmailConfirmationCodeUseCase,
  SendRecoveryPasswordCodeUseCase,
  ValidateUserUseCase,
  LogInUserUseCase,
  LogOutUserUseCase,
  UpdateUserPasswordUseCase,
];

const repositories = [
  UsersRepository,
  UsersQueryRepository,
  UsersTransactionRepository,
  DevicesRepository,
  DevicesQueryRepository,
  DevicesTransactionsRepository,
  InvalidRefreshTokensTransactionsRepository,
  TransactionsRepository,
  DataSourceRepository,
];

const strategies = [LocalStrategy, JwtStrategy, BasicStrategy];

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5000,
      },
    ]),
    CqrsModule,
    UsersModule,
    DevicesModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtService,
    RefreshTokenMiddleware,
    ...useCases,
    ...repositories,
    ...strategies,
  ],
})
export class AuthModule {}
