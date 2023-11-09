import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './controllers/users/users.controller';
import { UsersQueryRepository } from './infrastructure/repositories/users.query.repository';
import { UsersService } from './application/users.service';
import { UsersRepository } from './infrastructure/repositories/users.repository';
import { BlogController } from './controllers/blogs/blogs.controller';
import { BlogsQueryRepository } from './infrastructure/repositories/blogs.query.repository';
import { Blog, BlogSchema } from './schemas/blog.schema';
import { BlogsRepository } from './infrastructure/repositories/blogs.repository';
import { BlogsService } from './domains/blogs/blogs.service';
import { PostsController } from './controllers/posts/posts.controller';
import { PostsQueryRepository } from './infrastructure/repositories/posts.query.repository';
import { Post, PostSchema } from './schemas/post.schema';
import { PostLikes, PostLikesSchema } from './schemas/post.likes.schema';
import { LikesQueryRepository } from './infrastructure/repositories/likes.query.repository';
import { LikesRepository } from './infrastructure/repositories/likes.repository';
import { PostsRepository } from './infrastructure/repositories/posts.repository';
import { PostsService } from './domains/posts/posts.service';
import dotenv from 'dotenv';
import { CommentsQueryRepository } from './infrastructure/repositories/comments.query.repository';
import { CommentsRepository } from './infrastructure/repositories/comments.repository';
import { CommentSchema, Comment } from './schemas/comment.schema';
import { CommentsService } from './domains/comments/comments.service';
import { CommentsController } from './controllers/comments/comments.controller';
import { ResetDbController } from './controllers/testing/reset.db.controller';
import { ApiRequestRepository } from './infrastructure/repositories/api.requests.repository';
import { ApiRequest, ApiRequestSchema } from './schemas/api.request.schema';
import { ApiRequestService } from './application/api.request.service';
import { DevicesRepository } from './infrastructure/repositories/devices.repository';
import { Device, DeviceSchema } from './schemas/device.schema';
import { DevicesService } from './domains/devices/devices.service';
import { AuthController } from './controllers/auth/auth.controller';
import { AuthService } from './application/auth.service';
import { LocalStrategy } from './auth/strategies/local.strategy';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { BasicStrategy } from './auth/strategies/basic.strategy';
import { JwtService } from './application/jwt.service';
import { RefreshTokenMiddleware } from './application/refresh-token.service';
import { DevicesController } from './controllers/devices/devices.controller';
dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot(),
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
    LikesQueryRepository,
    LikesRepository,
    PostsRepository,
    PostsService,
    CommentsQueryRepository,
    CommentsRepository,
    CommentsService,
    ApiRequestRepository,
    ApiRequestService,
    DevicesRepository,
    DevicesService,
    AuthService,
    JwtService,
    LocalStrategy,
    JwtStrategy,
    BasicStrategy,
    RefreshTokenMiddleware,
  ],
})
export class AppModule {}
