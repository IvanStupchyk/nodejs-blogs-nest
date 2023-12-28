import { CommandHandler } from '@nestjs/cqrs';
import { errorMessageGenerator } from '../../../utils/errors/error-message-generator';
import { errorsConstants } from '../../../constants/errors.contants';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionsRepository } from '../../../infrastructure/repositories/transactions/transactions.repository';
import { UsersTransactionRepository } from '../../../infrastructure/repositories/users/users.transaction.repository';

export class ConfirmEmailCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase extends TransactionUseCase<
  ConfirmEmailCommand,
  boolean
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly usersTransactionRepository: UsersTransactionRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: ConfirmEmailCommand,
    manager: EntityManager,
  ): Promise<boolean> {
    const user =
      await this.usersTransactionRepository.findUserByConfirmationCode(
        command.code,
        manager,
      );

    if (!user) {
      errorMessageGenerator([
        {
          field: 'code',
          message: errorsConstants.confirmCode.invalidCodeFirst,
        },
      ]);
    } else {
      if (user.expirationDate < new Date() || user.isConfirmed) {
        errorMessageGenerator([
          {
            field: 'code',
            message: errorsConstants.confirmCode.invalidCodeSecond,
          },
        ]);
      }

      user.isConfirmed = true;
      return !!(await this.transactionsRepository.save(user, manager));
    }
  }

  async execute(command: ConfirmEmailCommand) {
    return super.execute(command);
  }
}
