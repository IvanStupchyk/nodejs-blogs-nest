import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from '../infrastructure/repositories/users/users.repository';
import { TransactionsRepository } from '../infrastructure/repositories/transactions/transactions.repository';
import { DataSourceRepository } from '../infrastructure/repositories/transactions/data-source.repository';
import { UsersTransactionRepository } from '../infrastructure/repositories/users/users.transaction.repository';
import { User } from '../entities/users/User.entity';
import { Blog } from '../entities/blogs/Blog.entity';
import { Post } from '../entities/posts/Post.entity';
import { PostLike } from '../entities/posts/Post-like.entity';
import { Comment } from '../entities/comments/Comment.entity';
import { CommentLike } from '../entities/comments/Comment-like.entity';
import { PostImage } from '../entities/posts/Post-image.entity';
import { BlogMainImage } from '../entities/blogs/Blog-main-image.entity';
import { BlogWallpaper } from '../entities/blogs/Blog-wallpaper.entity';
import { BlogSubscription } from '../entities/blogs/Blog-subscription.entity';
import { CreatePostUseCase } from '../domain/posts/use-cases/create-post-use-case';
import { ChangePostLikesCountUseCase } from '../domain/posts/use-cases/change-post-likes-count-use-case';
import { GetSortedPostsUseCase } from '../domain/posts/use-cases/get-sorted-posts-use-case';
import { GetPostByIdUseCase } from '../domain/posts/use-cases/get-post-by-id-use-case';
import { CreateCommentUseCase } from '../domain/comments/use-cases/create-comment-use-case';
import { UpdateCommentUseCase } from '../domain/comments/use-cases/update-comment-use-case';
import { GetCommentByIdUseCase } from '../domain/comments/use-cases/get-comment-by-id-use-case';
import { ChangeCommentLikesCountUseCase } from '../domain/comments/use-cases/change-comment-likes-count-use-case';
import { GetSortedCommentsUseCase } from '../domain/comments/use-cases/get-sorted-comments-use-case';
import { DeleteCommentUseCase } from '../domain/comments/use-cases/delete-comment-use-case';
import { CreateBlogUseCase } from '../domain/blogs/use-cases/create-blog-use-case';
import { UpdateBlogUseCase } from '../domain/blogs/use-cases/update-blog-use-case';
import { DeleteBlogUseCase } from '../domain/blogs/use-cases/delete-blog-use-case';
import { FindBlogByIdUseCase } from '../domain/blogs/use-cases/find-blog-by-id-use-case';
import { GetPostsForSpecifiedBlogUseCase } from '../domain/posts/use-cases/get-posts-for-specified-blog-use-case';
import { UpdatePostUseCase } from '../domain/posts/use-cases/update-post-use-case';
import { DeletePostUseCase } from '../domain/posts/use-cases/delete-post-use-case';
import { BindBlogWithUserCase } from '../domain/blogs/use-cases/bind-blog-with-user-use-case';
import { BanUserByBloggerUseCase } from '../domain/users/use-cases/ban-user-by-blogger-use-case';
import { FindBanUsersByBloggerUseCase } from '../domain/users/use-cases/find-ban-users-by-blogger-use-case';
import { BanBlogBySaUserCase } from '../domain/blogs/use-cases/ban-blog-by-sa-use-case';
import { SaveUserAvatarUseCase } from '../application/training/use-cases/saveUserAvatarUseCase';
import { AddImagePostUseCase } from '../domain/posts/use-cases/add-image-post-use-case';
import { AddMainBlogImageUseCase } from '../domain/blogs/use-cases/add-main-blog-image-use-case';
import { AddBlogWallpaperUseCase } from '../domain/blogs/use-cases/add-blog-wallpaper-use-case';
import { SubscribeBlogUseCase } from '../domain/blogs/use-cases/subscribe-blog-use-case';
import { UnsubscribeBlogUseCase } from '../domain/blogs/use-cases/unsubscribe-blog-use-case';
import { FilesSaveAdapter } from '../application/training/use-cases/filesSaveAdapter';
import { TelegramAdapter } from '../infrastructure/telegram/telegram.adapter';
import { S3Adapter } from '../infrastructure/aws/s3.adapter';
import { UsersQueryRepository } from '../infrastructure/repositories/users/users-query.repository';
import { DevicesRepository } from '../infrastructure/repositories/devices/devices.repository';
import { DevicesQueryRepository } from '../infrastructure/repositories/devices/devices-query.repository';
import { BlogsRepository } from '../infrastructure/repositories/blogs/blogs.repository';
import { BlogsQueryRepository } from '../infrastructure/repositories/blogs/blogs-query.repository';
import { PostsRepository } from '../infrastructure/repositories/posts/posts.repository';
import { CommentsRepository } from '../infrastructure/repositories/comments/comments.repository';
import { BlogsTransactionsRepository } from '../infrastructure/repositories/blogs/blogs-transactions.repository';
import { PostsTransactionsRepository } from '../infrastructure/repositories/posts/posts-transactions.repository';
import { PostLikesTransactionsRepository } from '../infrastructure/repositories/posts/post-likes-transactions.repository';
import { CommentsTransactionsRepository } from '../infrastructure/repositories/comments/comments-transactions.repository';
import { CommentLikesTransactionsRepository } from '../infrastructure/repositories/comments/comment-likes-transactions.repository';
import { CommentsQueryRepository } from '../infrastructure/repositories/comments/comments-query.repository';
import { BlogSubscribersRepository } from '../infrastructure/repositories/blogs/blog-subscribers.repository';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenMiddleware } from '../middlewares/refresh-token.middleware';
import { IsBlogExistConstraint } from '../utils/decorators/existing-blog.decorator';
import { IsUserExistConstraint } from '../utils/decorators/existing-user.decorator';
import { isBlogHasOwnerDataConstraint } from '../utils/decorators/bind-blog-with-user.decorator';
import { BlogCreateHandler } from '../application/events-handlers/create-blog.event.handler';
import { BlogUpdateHandler } from '../application/events-handlers/update-blog.event.handler';
import { UsersSaController } from '../controllers/super-admin/users.sa.controller';
import { BlogSaController } from '../controllers/super-admin/blogs.sa.controller';
import { BlogController } from '../controllers/public/blogs.controller';
import { BloggerBlogsController } from '../controllers/blogger/blogger.blogs.controller';
import { PostsController } from '../controllers/public/posts.controller';
import { CommentsController } from '../controllers/public/comments.controller';
import { ResetDbController } from '../controllers/public/reset-db.controller';
import { AuthController } from '../controllers/public/auth.controller';
import { DevicesController } from '../controllers/public/devices.controller';
import { DevicesModule } from './devices.module';

const useCases = [
  CreatePostUseCase,
  ChangePostLikesCountUseCase,
  GetSortedPostsUseCase,
  GetPostByIdUseCase,
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
  GetPostsForSpecifiedBlogUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  BindBlogWithUserCase,
  BanUserByBloggerUseCase,
  FindBanUsersByBloggerUseCase,
  BanBlogBySaUserCase,
  SaveUserAvatarUseCase,
  AddImagePostUseCase,
  AddMainBlogImageUseCase,
  AddBlogWallpaperUseCase,
  SubscribeBlogUseCase,
  UnsubscribeBlogUseCase,
  FilesSaveAdapter,
  TelegramAdapter,
  S3Adapter,
];

const entities = [
  User,
  Blog,
  Post,
  PostLike,
  Comment,
  CommentLike,
  PostImage,
  BlogMainImage,
  BlogWallpaper,
  BlogSubscription,
];

const repositories = [
  UsersQueryRepository,
  UsersRepository,
  DevicesRepository,
  DevicesQueryRepository,
  BlogsRepository,
  BlogsQueryRepository,
  PostsRepository,
  CommentsRepository,
  TransactionsRepository,
  DataSourceRepository,
  UsersTransactionRepository,
  BlogsTransactionsRepository,
  PostsTransactionsRepository,
  PostLikesTransactionsRepository,
  CommentsTransactionsRepository,
  CommentLikesTransactionsRepository,
  CommentsQueryRepository,
  BlogSubscribersRepository,
];

const controllers = [
  UsersSaController,
  BlogSaController,
  BlogController,
  BloggerBlogsController,
  PostsController,
  CommentsController,
  ResetDbController,
  AuthController,
  DevicesController,
];

@Module({
  imports: [TypeOrmModule.forFeature([...entities]), CqrsModule, DevicesModule],
  controllers: [...controllers],
  providers: [
    JwtService,
    RefreshTokenMiddleware,
    IsBlogExistConstraint,
    IsUserExistConstraint,
    isBlogHasOwnerDataConstraint,
    BlogCreateHandler,
    BlogUpdateHandler,
    ...repositories,
    ...useCases,
  ],
  exports: [TypeOrmModule],
})
export class MainModule {}
