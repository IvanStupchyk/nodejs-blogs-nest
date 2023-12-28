import { CommandHandler } from "@nestjs/cqrs";
import { BindBlogParamsDto } from "../../../application/dto/blogs/bind-blog.params.dto";
import { exceptionHandler } from "../../../utils/errors/exception.handler";
import { HttpStatus } from "@nestjs/common";
import { TransactionUseCase } from "../../transaction/use-case/transaction-use-case";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, EntityManager } from "typeorm";
import { UsersTransactionRepository } from "../../../infrastructure/repositories/users/users.transaction.repository";
import { TransactionsRepository } from "../../../infrastructure/repositories/transactions/transactions.repository";
import { BlogsTransactionsRepository } from "../../../infrastructure/repositories/blogs/blogs-transactions.repository";

export class BindBlogWithUserCommand {
  constructor(public params: BindBlogParamsDto) {}
}

@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserCase extends TransactionUseCase<
  BindBlogWithUserCommand,
  number | void
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly blogsTransactionsRepository: BlogsTransactionsRepository,
    private readonly usersTransactionRepository: UsersTransactionRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: BindBlogWithUserCommand,
    manager: EntityManager,
  ): Promise<number | void> {
    const user = await this.usersTransactionRepository.fetchAllUserDataById(
      command.params.userId,
      manager,
    );

    const blog = await this.blogsTransactionsRepository.findBlogById(
      command.params.id,
      manager,
    );

    if (blog.user) {
      return exceptionHandler(HttpStatus.BAD_REQUEST);
    }

    blog.user = user;
    await this.transactionsRepository.save(blog, manager);

    return HttpStatus.NO_CONTENT;
  }

  async execute(command: BindBlogWithUserCommand) {
    return super.execute(command);
  }
}
