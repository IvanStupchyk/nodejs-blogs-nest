import { CommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';
import { emailTemplatesManager } from '../../../infrastructure/email-templates-manager';
import { UserInputDto } from '../../../application/dto/users/user.input.dto';
import { User } from '../../../entities/users/User.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { TransactionsRepository } from '../../../infrastructure/repositories/transactions/transactions.repository';
import { UsersTransactionRepository } from '../../../infrastructure/repositories/users/users.transaction.repository';
import { UserBanInfo } from '../../../entities/users/User-ban-info.entity';
import { UserBanByBlogger } from '../../../entities/users/User-ban-by-blogger.entity';

export class CreateCommonUserCommand {
  constructor(public userData: UserInputDto) {}
}

@CommandHandler(CreateCommonUserCommand)
export class CreateCommonUserUseCase extends TransactionUseCase<
  CreateCommonUserCommand,
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
    command: CreateCommonUserCommand,
    manager: EntityManager,
  ): Promise<boolean> {
    const { login, email, password } = command.userData;

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = User.createCommonUser(login, email, passwordHash);
    const userBanInfo = UserBanInfo.create(newUser);
    const userBanByBlogger = UserBanByBlogger.create(newUser);

    const savedUser = await this.transactionsRepository.save(newUser, manager);
    await this.transactionsRepository.save(userBanInfo, manager);
    await this.transactionsRepository.save(userBanByBlogger, manager);
    try {
      await emailTemplatesManager.sendEmailConfirmationMessage(newUser);
    } catch (error) {
      console.log('sendEmailConfirmationMessage error', error);
      await this.usersTransactionRepository.deleteUser(savedUser.id, manager);
      return false;
    }

    return !!savedUser;
  }

  async execute(command: CreateCommonUserCommand) {
    return super.execute(command);
  }
}
