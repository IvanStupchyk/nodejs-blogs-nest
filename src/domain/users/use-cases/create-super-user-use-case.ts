import { CommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { UserViewType } from '../../../types/users.types';
import { User } from '../../../entities/users/User.entity';
import { SAUserInputDto } from '../../../application/dto/users/sa-user.input.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { TransactionsRepository } from '../../../infrastructure/repositories/transactions/transactions.repository';
import { UserBanInfo } from '../../../entities/users/User-ban-info.entity';
import { UserBanByBlogger } from '../../../entities/users/User-ban-by-blogger.entity';

export class CreateSuperUserCommand {
  constructor(public userData: SAUserInputDto) {}
}

@CommandHandler(CreateSuperUserCommand)
export class CreateSuperUserUseCase extends TransactionUseCase<
  CreateSuperUserCommand,
  UserViewType
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: CreateSuperUserCommand,
    manager: EntityManager,
  ): Promise<UserViewType> {
    const { login, email, password } = command.userData;

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = User.createAdminUser(login, email, passwordHash);
    const userBanInfo = UserBanInfo.create(newUser);
    const userBanByBlogger = UserBanByBlogger.create(newUser);

    const savedUser = await this.transactionsRepository.save(newUser, manager);
    await this.transactionsRepository.save(userBanInfo, manager);
    await this.transactionsRepository.save(userBanByBlogger, manager);

    return {
      id: savedUser.id,
      login: savedUser.login,
      email: savedUser.email,
      createdAt: savedUser.createdAt,
      banInfo: {
        isBanned: userBanInfo.isBanned,
        banDate: null,
        banReason: null,
      },
    };
  }

  async execute(command: CreateSuperUserCommand) {
    return super.execute(command);
  }
}
