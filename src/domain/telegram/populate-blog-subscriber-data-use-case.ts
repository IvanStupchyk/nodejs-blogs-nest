import { CommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionUseCase } from '../transaction/use-case/transaction-use-case';
import { TransactionsRepository } from '../../infrastructure/repositories/transactions/transactions.repository';
import { UsersRepository } from '../../infrastructure/repositories/users/users.repository';
import process from 'process';

export class PopulateBlogSubscriberDataCommand {
  constructor(
    public message: string,
    public telegramId: number,
  ) {}
}

@CommandHandler(PopulateBlogSubscriberDataCommand)
export class PopulateBlogSubscriberDataUseCase extends TransactionUseCase<
  PopulateBlogSubscriberDataCommand,
  void
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly usersRepository: UsersRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: PopulateBlogSubscriberDataCommand,
    manager: EntityManager,
  ): Promise<void> {
    const isUserAlreadyRegistered =
      await this.usersRepository.findUserByTelegramId(command.telegramId);

    if (isUserAlreadyRegistered) {
      return null;
    }

    let activationCode: string;
    if (process.env.TELEGRAM_ENV === 'local') {
      activationCode = command.message?.split('')[1];
    } else {
      activationCode = command.message?.split('=')[1];
    }

    const user =
      await this.usersRepository.findUserByActivationBotCode(activationCode);

    if (!user) {
      return null;
    }

    user.telegramId = command.telegramId;
    await this.transactionsRepository.save(user, manager);
  }

  async execute(command: PopulateBlogSubscriberDataCommand) {
    return super.execute(command);
  }
}
