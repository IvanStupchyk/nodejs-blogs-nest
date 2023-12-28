import { CommandHandler } from '@nestjs/cqrs';
import { errorMessageGenerator } from '../../../utils/errors/error-message-generator';
import { errorsConstants } from '../../../constants/errors.contants';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { emailTemplatesManager } from '../../../infrastructure/email-templates-manager';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionsRepository } from '../../../infrastructure/repositories/transactions/transactions.repository';
import { UsersTransactionRepository } from '../../../infrastructure/repositories/users/users.transaction.repository';

export class ResendEmailConfirmationCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendEmailConfirmationCodeCommand)
export class ResendEmailConfirmationCodeUseCase extends TransactionUseCase<
  ResendEmailConfirmationCodeCommand,
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
    command: ResendEmailConfirmationCodeCommand,
    manager: EntityManager,
  ): Promise<boolean> {
    const user = await this.usersTransactionRepository.findUserByLoginOrEmail(
      command.email,
      manager,
    );
    if (!user || user.isConfirmed) {
      errorMessageGenerator([
        { field: 'email', message: errorsConstants.email.checkEmail },
      ]);
    }

    const newCode = uuidv4();

    user.expirationDate = add(new Date(), {
      hours: 1,
      minutes: 30,
    });
    user.confirmationCode = newCode;
    await this.transactionsRepository.save(user, manager);

    try {
      await emailTemplatesManager.resendEmailConfirmationMessage(
        command.email,
        newCode,
      );
    } catch (error) {
      console.log('resendEmailConfirmationMessage error', error);
    }

    return true;
  }

  async execute(command: ResendEmailConfirmationCodeCommand) {
    return super.execute(command);
  }
}
