import { Module } from '@nestjs/common';
import { TelegramAdapter } from '../infrastructure/telegram/telegram.adapter';
import { UsersRepository } from '../infrastructure/repositories/users/users.repository';
import { UsersModule } from './users.module';
import { CqrsModule } from '@nestjs/cqrs';
import { TelegramController } from '../controllers/telegram/telegram.controller';
import { GetTelegramLinkUseCase } from '../domain/telegram/get-telegram-link-use-case';
import { DataSourceRepository } from '../infrastructure/repositories/transactions/data-source.repository';
import { PopulateBlogSubscriberDataUseCase } from '../domain/telegram/populate-blog-subscriber-data-use-case';
import { UsersTransactionRepository } from '../infrastructure/repositories/users/users.transaction.repository';
import { TransactionsRepository } from '../infrastructure/repositories/transactions/transactions.repository';

const useCases = [GetTelegramLinkUseCase, PopulateBlogSubscriberDataUseCase];
const repositories = [
  DataSourceRepository,
  UsersRepository,
  UsersTransactionRepository,
  TransactionsRepository,
];

@Module({
  imports: [UsersModule, CqrsModule],
  controllers: [TelegramController],
  providers: [TelegramAdapter, ...useCases, ...repositories],
})
export class TelegramModule {}
