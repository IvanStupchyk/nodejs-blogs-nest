import { ConfigModule } from '@nestjs/config';
const configModule = ConfigModule.forRoot();

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './controllers/users/users.controller';
import { UsersQueryRepository } from './infrastructure/repositories/users-query.repository';
import { UsersService } from './domains/users/users.service';
import { UsersRepository } from './infrastructure/repositories/users.repository';
import { BlogController } from './controllers/blogs/blogs.controller';
import { BlogsQueryRepository } from './infrastructure/repositories/blogs-query.repository';
import { Blog, BlogSchema } from './schemas/blog.schema';
import { BlogsRepository } from './infrastructure/repositories/blogs.repository';
import { BlogsService } from './domains/blogs/blogs.service';
import { PostsController } from './controllers/posts/posts.controller';
import { PostsQueryRepository } from './infrastructure/repositories/posts-query.repository';
import { Post, PostSchema } from './schemas/post.schema';
import { PostLikes, PostLikesSchema } from './schemas/post-likes.schema';
import { LikesRepository } from './infrastructure/repositories/likes.repository';
import { PostsRepository } from './infrastructure/repositories/posts.repository';
import { PostsService } from './domains/posts/posts.service';
import { CommentsRepository } from './infrastructure/repositories/comments.repository';
import { CommentSchema, Comment } from './schemas/comment.schema';
import { CommentsService } from './domains/comments/comments.service';
import { CommentsController } from './controllers/comments/comments.controller';
import { ResetDbController } from './controllers/testing/reset-db.controller';
import { ApiRequestRepository } from './infrastructure/repositories/api-requests.repository';
import { ApiRequest, ApiRequestSchema } from './schemas/api-request.schema';
import { ApiRequestService } from './application/api-request.service';
import { DevicesRepository } from './infrastructure/repositories/devices.repository';
import { Device, DeviceSchema } from './schemas/device.schema';
import { AuthController } from './controllers/auth/auth.controller';
import { AuthService } from './application/auth.service';
import { LocalStrategy } from './auth/strategies/local.strategy';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { BasicStrategy } from './auth/strategies/basic.strategy';
import { JwtService } from './infrastructure/jwt.service';
import { RefreshTokenMiddleware } from './infrastructure/refresh-token.middleware';
import { DevicesController } from './controllers/devices/devices.controller';
import { IsBlogExistConstraint } from './utils/decorators/existing-blog.decorator';
import { CreatePostUseCase } from './domains/posts/use-cases/create-post-use-case';
import { UpdatePostUseCase } from './domains/posts/use-cases/update-post-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePostForSpecifiedBlogUseCase } from './domains/posts/use-cases/create-post-for-specified-blog-use-case';
import { ChangePostLikesCountUseCase } from './domains/posts/use-cases/change-post-likes-count-use-case';
import { GetSortedPostsUseCase } from './domains/posts/use-cases/get-sorted-posts-use-case';
import { GetPostByIdUseCase } from './domains/posts/use-cases/get-post-by-id-use-case';
import { DeletePostUseCase } from './domains/posts/use-cases/delete-post-use-case';
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

const useCases = [
  CreatePostUseCase,
  UpdatePostUseCase,
  CreatePostForSpecifiedBlogUseCase,
  ChangePostLikesCountUseCase,
  GetSortedPostsUseCase,
  GetPostByIdUseCase,
  DeletePostUseCase,
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
];

@Module({
  imports: [
    CqrsModule,
    configModule,
    MongooseModule.forRoot(process.env.DATABASE_MONGOOSE_URI),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
    MongooseModule.forFeature([
      { name: ApiRequest.name, schema: ApiRequestSchema },
    ]),
    MongooseModule.forFeature([
      { name: PostLikes.name, schema: PostLikesSchema },
    ]),
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
    UsersService,
    BlogsQueryRepository,
    BlogsRepository,
    BlogsService,
    PostsQueryRepository,
    LikesRepository,
    PostsRepository,
    PostsService,
    CommentsRepository,
    CommentsService,
    ApiRequestRepository,
    ApiRequestService,
    DevicesRepository,
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
