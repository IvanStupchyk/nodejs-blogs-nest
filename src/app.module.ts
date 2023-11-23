import { ConfigModule } from '@nestjs/config';
const configModule = ConfigModule.forRoot();

import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { BlogController } from './controllers/blogs.controller';
import { PostsController } from './controllers/posts.controller';
import { PostsService } from './domains/posts/posts.service';
import { CommentsController } from './controllers/comments.controller';
import { ResetDbController } from './controllers/reset-db.controller';
import { ApiRequestService } from './application/api-request.service';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './application/auth.service';
import { LocalStrategy } from './auth/strategies/local.strategy';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { BasicStrategy } from './auth/strategies/basic.strategy';
import { JwtService } from './infrastructure/jwt.service';
import { RefreshTokenMiddleware } from './middlewares/refresh-token.middleware';
import { DevicesController } from './controllers/devices.controller';
import { IsBlogExistConstraint } from './utils/decorators/existing-blog.decorator';
import { CreatePostUseCase } from './domains/posts/use-cases/create-post-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePostForSpecifiedBlogUseCase } from './domains/posts/use-cases/create-post-for-specified-blog-use-case';
import { ChangePostLikesCountUseCase } from './domains/posts/use-cases/change-post-likes-count-use-case';
import { GetSortedPostsUseCase } from './domains/posts/use-cases/get-sorted-posts-use-case';
import { GetPostByIdUseCase } from './domains/posts/use-cases/get-post-by-id-use-case';
import { DeleteDeviceUseCase } from './domains/devices/use-cases/delete-device-use-case';
import { CreateCommentUseCase } from './domains/comments/use-cases/create-comment-use-case';
import { UpdateCommentUseCase } from './domains/comments/use-cases/update-comment-use-case';
import { GetCommentByIdUseCase } from './domains/comments/use-cases/get-comment-by-id-use-case';
import { ChangeCommentLikesCountUseCase } from './domains/comments/use-cases/change-comment-likes-count-use-case';
import { GetSortedCommentsUseCase } from './domains/comments/use-cases/get-sorted-comments-use-case';
import { DeleteCommentUseCase } from './domains/comments/use-cases/delete-comment-use-case';
import { CreateBlogUseCase } from './domains/blogs/use-cases/create-blog-use-case';
import { UpdateBlogUseCase } from './domains/blogs/use-cases/update-blog-use-case';
import { DeleteBlogUseCase } from './domains/blogs/use-cases/delete-blog-use-case';
import { FindBlogByIdUseCase } from './domains/blogs/use-cases/find-blog-by-id-use-case';
import { CreateSuperUserUseCase } from './domains/users/use-cases/create-super-user-use-case';
import { DeleteUserUseCase } from './domains/users/use-cases/delete-user-use-case';
import { UpdateUserPasswordUseCase } from './domains/auth/use-cases/update-user-password-use-case';
import { RefreshTokenUseCase } from './domains/auth/use-cases/refresh-token-use-case';
import { ConfirmEmailUseCase } from './domains/auth/use-cases/confirm-email-use-case';
import { ResendEmailConfirmationCodeUseCase } from './domains/auth/use-cases/resend-email-confirmation-code-use-case';
import { SendRecoveryPasswordCodeUseCase } from './domains/auth/use-cases/send-recovery-password-code-use-case';
import { GetCurrentUserUseCase } from './domains/auth/use-cases/get-current-user-use-case';
import { LogInUserUseCase } from './domains/auth/use-cases/log-in-user-use-case';
import { LogOutUserUseCase } from './domains/auth/use-cases/log-out-user-use-case';
import { CreateCommonUserUseCase } from './domains/auth/use-cases/create-common-user-use-case';
import { ValidateUserUseCase } from './domains/auth/use-cases/validate-user-use-case';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersQueryRepository } from './infrastructure/repositories/users-query.repository';
import { UsersRepository } from './infrastructure/repositories/users.repository';
import { DevicesRepository } from './infrastructure/repositories/devices.repository';
import { InvalidRefreshTokensRepository } from './infrastructure/repositories/invalid-refresh-tokens.repository';
import { DevicesQueryRepository } from './infrastructure/repositories/devices-query.repository';
import { ApiRequestsRepository } from './infrastructure/repositories/api-requests.repository';
import { BlogsRepository } from './infrastructure/repositories/blogs.repository';
import { BlogsQueryRepository } from './infrastructure/repositories/blogs-query.repository';
import { PostsRepository } from './infrastructure/repositories/posts.repository';
import { GetPostsForSpecifiedBlogUseCase } from './domains/posts/use-cases/get-posts-for-specified-blog-use-case';
import { UpdatePostWithCheckingUseCase } from './domains/blogs/use-cases/update-post-with-checking-use-case';
import { DeletePostWithCheckingUseCase } from './domains/blogs/use-cases/delete-post-with-checking-use-case';
import { PostLikesRepository } from './infrastructure/repositories/post-likes.repository';
import { CommentsRepository } from './infrastructure/repositories/comments.repository';
import { CommentLikesRepository } from './infrastructure/repositories/comment-likes.repository';

const useCases = [
  CreatePostUseCase,
  CreatePostForSpecifiedBlogUseCase,
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

@Module({
  imports: [
    CqrsModule,
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 50000,
      },
    ]),
    configModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_SQL_HOST,
      port: 5432,
      username: process.env.DATABASE_SQL_USERNAME,
      password: process.env.DATABASE_SQL_PASSWORD,
      database: process.env.DATABASE_NAME_SQL,
      autoLoadEntities: false,
      synchronize: false,
      ssl: true,
    }),
  ],
  controllers: [
    UsersController,
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
    ApiRequestsRepository,
    BlogsRepository,
    BlogsQueryRepository,
    PostsRepository,
    PostLikesRepository,
    CommentsRepository,
    CommentLikesRepository,
    PostsService,
    ApiRequestService,
    AuthService,
    JwtService,
    LocalStrategy,
    JwtStrategy,
    BasicStrategy,
    RefreshTokenMiddleware,
    IsBlogExistConstraint,
    ...useCases,
  ],
})
export class AppModule {}
