import { CommandHandler } from '@nestjs/cqrs';
import { errorMessageGenerator } from '../../../utils/errors/error-message-generator';
import { errorsConstants } from '../../../constants/errors.contants';
import bcrypt from 'bcrypt';
import { JwtService } from '../../../infrastructure/jwt.service';
import { NewPasswordInputDto } from '../../../application/dto/auth/new-password.input.dto';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { UsersTransactionRepository } from '../../../infrastructure/repositories/users/users.transaction.repository';
import { TransactionsRepository } from '../../../infrastructure/repositories/transactions/transactions.repository';

export class UpdateUserPasswordCommand {
  constructor(public body: NewPasswordInputDto) {}
}

@CommandHandler(UpdateUserPasswordCommand)
export class UpdateUserPasswordUseCase extends TransactionUseCase<
  UpdateUserPasswordCommand,
  boolean
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly usersTransactionRepository: UsersTransactionRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: UpdateUserPasswordCommand,
    manager: EntityManager,
  ): Promise<boolean> {
    const { newPassword, recoveryCode } = command.body;

    const result: any =
      await this.jwtService.verifyPasswordRecoveryCode(recoveryCode);
    if (!result) {
      errorMessageGenerator([
        {
          field: 'recoveryCode',
          message: errorsConstants.recoveryCode.recoveryCodeFirst,
        },
      ]);
    }

    const user = await this.usersTransactionRepository.fetchAllUserDataById(
      result.userId,
      manager,
    );
    if (!user) {
      errorMessageGenerator([
        {
          field: 'recoveryCode',
          message: errorsConstants.recoveryCode.recoveryCodeSecond,
        },
      ]);
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);

    return !!(await this.transactionsRepository.save(user, manager));
  }

  async execute(command: UpdateUserPasswordCommand) {
    return super.execute(command);
  }
}
