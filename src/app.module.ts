import { ConfigModule } from '@nestjs/config';
const configModule = ConfigModule.forRoot();

import { Module } from '@nestjs/common';
import { UsersSaController } from './controllers/super-admin/users.sa.controller';
import { BlogController } from './controllers/public/blogs.controller';
import { PostsController } from './controllers/public/posts.controller';
import { CommentsController } from './controllers/public/comments.controller';
import { ResetDbController } from './controllers/public/reset-db.controller';
import { AuthController } from './controllers/public/auth.controller';
import { LocalStrategy } from './auth/strategies/local.strategy';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { BasicStrategy } from './auth/strategies/basic.strategy';
import { JwtService } from './infrastructure/jwt.service';
import { RefreshTokenMiddleware } from './middlewares/refresh-token.middleware';
import { DevicesController } from './controllers/public/devices.controller';
import { IsBlogExistConstraint } from './utils/decorators/existing-blog.decorator';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePostUseCase } from './domain/posts/use-cases/create-post-use-case';
import { ChangePostLikesCountUseCase } from './domain/posts/use-cases/change-post-likes-count-use-case';
import { GetSortedPostsUseCase } from './domain/posts/use-cases/get-sorted-posts-use-case';
import { GetPostByIdUseCase } from './domain/posts/use-cases/get-post-by-id-use-case';
import { DeleteDeviceUseCase } from './domain/devices/use-cases/delete-device-use-case';
import { CreateCommentUseCase } from './domain/comments/use-cases/create-comment-use-case';
import { UpdateCommentUseCase } from './domain/comments/use-cases/update-comment-use-case';
import { GetCommentByIdUseCase } from './domain/comments/use-cases/get-comment-by-id-use-case';
import { ChangeCommentLikesCountUseCase } from './domain/comments/use-cases/change-comment-likes-count-use-case';
import { GetSortedCommentsUseCase } from './domain/comments/use-cases/get-sorted-comments-use-case';
import { DeleteCommentUseCase } from './domain/comments/use-cases/delete-comment-use-case';
import { CreateBlogUseCase } from './domain/blogs/use-cases/create-blog-use-case';
import { UpdateBlogUseCase } from './domain/blogs/use-cases/update-blog-use-case';
import { DeleteBlogUseCase } from './domain/blogs/use-cases/delete-blog-use-case';
import { FindBlogByIdUseCase } from './domain/blogs/use-cases/find-blog-by-id-use-case';
import { CreateSuperUserUseCase } from './domain/users/use-cases/create-super-user-use-case';
import { DeleteUserUseCase } from './domain/users/use-cases/delete-user-use-case';
import { UpdateUserPasswordUseCase } from './domain/auth/use-cases/update-user-password-use-case';
import { RefreshTokenUseCase } from './domain/auth/use-cases/refresh-token-use-case';
import { ConfirmEmailUseCase } from './domain/auth/use-cases/confirm-email-use-case';
import { ResendEmailConfirmationCodeUseCase } from './domain/auth/use-cases/resend-email-confirmation-code-use-case';
import { SendRecoveryPasswordCodeUseCase } from './domain/auth/use-cases/send-recovery-password-code-use-case';
import { GetCurrentUserUseCase } from './domain/auth/use-cases/get-current-user-use-case';
import { LogInUserUseCase } from './domain/auth/use-cases/log-in-user-use-case';
import { LogOutUserUseCase } from './domain/auth/use-cases/log-out-user-use-case';
import { CreateCommonUserUseCase } from './domain/auth/use-cases/create-common-user-use-case';
import { ValidateUserUseCase } from './domain/auth/use-cases/validate-user-use-case';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersQueryRepository } from './infrastructure/repositories/users/users-query.repository';
import { UsersRepository } from './infrastructure/repositories/users/users.repository';
import { DevicesRepository } from './infrastructure/repositories/devices/devices.repository';
import { InvalidRefreshTokensRepository } from './infrastructure/repositories/users/invalid-refresh-tokens.repository';
import { DevicesQueryRepository } from './infrastructure/repositories/devices/devices-query.repository';
import { BlogsRepository } from './infrastructure/repositories/blogs/blogs.repository';
import { BlogsQueryRepository } from './infrastructure/repositories/blogs/blogs-query.repository';
import { PostsRepository } from './infrastructure/repositories/posts/posts.repository';
import { GetPostsForSpecifiedBlogUseCase } from './domain/posts/use-cases/get-posts-for-specified-blog-use-case';
import { UpdatePostWithCheckingUseCase } from './domain/blogs/use-cases/update-post-with-checking-use-case';
import { DeletePostWithCheckingUseCase } from './domain/blogs/use-cases/delete-post-with-checking-use-case';
import { PostLikesRepository } from './infrastructure/repositories/posts/post-likes.repository';
import { CommentsRepository } from './infrastructure/repositories/comments/comments.repository';
import { CommentLikesRepository } from './infrastructure/repositories/comments/comment-likes.repository';
import { Device } from './entities/devices/Device.entity';
import { InvalidRefreshToken } from './entities/users/Invalid-refresh-tokens.entity';
import { User } from './entities/users/User.entity';
import { globalBdOptions, localBdOptions } from './constants/db-options';
import { Blog } from './entities/blogs/Blog.entity';
import { Post } from './entities/posts/Post.entity';
import { PostLike } from './entities/posts/Post-like.entity';
import { Comment } from './entities/comments/Comment.entity';
import { CommentLike } from './entities/comments/Comment-like.entity';
import { BlogSaController } from './controllers/super-admin/blogs.sa.controller';
import { IsEmailExistConstraint } from './utils/decorators/unique-email.decorator';
import { IsLoginExistConstraint } from './utils/decorators/unique-login.decorator';
import { TransactionsRepository } from './infrastructure/repositories/transactions/transactions.repository';
import { DataSourceRepository } from './infrastructure/repositories/transactions/data-source.repository';

const useCases = [
  CreatePostUseCase,
  ChangePostLikesCountUseCase,
  GetSortedPostsUseCase,
  GetPostByIdUseCase,
  DeleteDeviceUseCase,
  CreateCommentUseCase,
  UpdateCommentUseCase,
  GetCommentByIdUseCase,
  ChangeCommentLikesCountUseCase,
  GetSortedCommentsUseCase,
  DeleteCommentUseCase,
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  FindBlogByIdUseCase,
  CreateSuperUserUseCase,
  DeleteUserUseCase,
  UpdateUserPasswordUseCase,
  RefreshTokenUseCase,
  ConfirmEmailUseCase,
  ResendEmailConfirmationCodeUseCase,
  SendRecoveryPasswordCodeUseCase,
  GetCurrentUserUseCase,
  LogInUserUseCase,
  LogOutUserUseCase,
  CreateCommonUserUseCase,
  ValidateUserUseCase,
  GetPostsForSpecifiedBlogUseCase,
  UpdatePostWithCheckingUseCase,
  DeletePostWithCheckingUseCase,
];

const entities = [
  User,
  Device,
  InvalidRefreshToken,
  Blog,
  Post,
  PostLike,
  Comment,
  CommentLike,
];

@Module({
  imports: [
    CqrsModule,
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5000,
      },
    ]),
    configModule,
    TypeOrmModule.forRoot(globalBdOptions),
    TypeOrmModule.forFeature([...entities]),
  ],
  controllers: [
    UsersSaController,
    BlogSaController,
    BlogController,
    PostsController,
    CommentsController,
    ResetDbController,
    AuthController,
    DevicesController,
  ],
  providers: [
    UsersQueryRepository,
    UsersRepository,
    DevicesRepository,
    InvalidRefreshTokensRepository,
    DevicesQueryRepository,
    BlogsRepository,
    BlogsQueryRepository,
    PostsRepository,
    PostLikesRepository,
    CommentsRepository,
    CommentLikesRepository,
    TransactionsRepository,
    DataSourceRepository,
    JwtService,
    LocalStrategy,
    JwtStrategy,
    BasicStrategy,
    RefreshTokenMiddleware,
    IsBlogExistConstraint,
    IsEmailExistConstraint,
    IsLoginExistConstraint,
    ...useCases,
  ],
})
export class AppModule {}
