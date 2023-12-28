import { CommandHandler } from "@nestjs/cqrs";
import { HttpStatus } from "@nestjs/common";
import { PostForSpecifiedBlogInputDto } from "../../../application/dto/posts/post-for-specified-blog.input.dto";
import { isUUID } from "../../../utils/utils";
import { PostViewType } from "../../../types/posts.types";
import { Post } from "../../../entities/posts/Post.entity";
import { likeStatus } from "../../../types/general.types";
import { exceptionHandler } from "../../../utils/errors/exception.handler";
import { TransactionUseCase } from "../../transaction/use-case/transaction-use-case";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, EntityManager } from "typeorm";
import { TransactionsRepository } from "../../../infrastructure/repositories/transactions/transactions.repository";
import { BlogsTransactionsRepository } from "../../../infrastructure/repositories/blogs/blogs-transactions.repository";
import { UsersTransactionRepository } from "../../../infrastructure/repositories/users/users.transaction.repository";

export class CreatePostCommand {
  constructor(
    public postData: PostForSpecifiedBlogInputDto,
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase extends TransactionUseCase<
  CreatePostCommand,
  PostViewType | void
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
    command: CreatePostCommand,
    manager: EntityManager,
  ): Promise<PostViewType | void> {
    const { title, content, shortDescription } = command.postData;

    if (!isUUID(command.blogId)) return null;
    const foundBlog = await this.blogsTransactionsRepository.findBlogById(
      command.blogId,
      manager,
    );

    if (!foundBlog) {
      return exceptionHandler(HttpStatus.NOT_FOUND);
    }
    if (foundBlog && foundBlog.user && foundBlog.user.id !== command.userId) {
      return exceptionHandler(HttpStatus.FORBIDDEN);
    }

    const user = await this.usersTransactionRepository.fetchAllUserDataById(
      command.userId,
      manager,
    );

    const newPost = Post.create(
      title,
      content,
      shortDescription,
      foundBlog.name,
      foundBlog,
      user,
    );

    const savedPost = await this.transactionsRepository.save(newPost, manager);

    return {
      id: savedPost.id,
      title: savedPost.title,
      content: savedPost.content,
      blogId: savedPost.blog.id,
      blogName: savedPost.blogName,
      createdAt: savedPost.createdAt,
      shortDescription: savedPost.shortDescription,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: likeStatus.None,
        newestLikes: [],
      },
    };
  }

  async execute(command: CreatePostCommand) {
    return super.execute(command);
  }
}
