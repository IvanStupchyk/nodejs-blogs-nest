import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './controllers/users/users.controller';
import { UsersQueryRepository } from './repositories/users.query.repository';
import { UsersService } from './application/users.service';
import { UsersRepository } from './repositories/users.repository';
import { BlogController } from './controllers/blogs/blogs.controller';
import { BlogsQueryRepository } from './repositories/blogs.query.repository';
import { Blog, BlogSchema } from './schemas/blog.schema';
import { BlogsRepository } from './repositories/blogsRepository';
import { BlogsService } from './domains/blogs/blogs.service';
import { PostsController } from './controllers/posts/posts.controller';
import { PostsQueryRepository } from './repositories/posts.query.repository';
import { Post, PostSchema } from './schemas/post.schema';
import { PostLikes, PostLikesSchema } from './schemas/post.likes.schema';
import { LikesQueryRepository } from './repositories/likes.query.repository';
import { LikesRepository } from './repositories/likesRepository';
import { PostsRepository } from './repositories/postsRepository';
import { PostsService } from './domains/posts/posts.service';
import dotenv from 'dotenv';
import { CommentsQueryRepository } from './repositories/comentsQueryRepository';
import { CommentsRepository } from './repositories/comentsRepository';
import { CommentSchema, Comment } from './schemas/comment.schema';
import { CommentsService } from './domains/comments/comments.service';
import { CommentsController } from './controllers/comments/comments.controller';
import { ResetDbController } from './controllers/testing/reset.db.controller';
dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DATABASE_MONGOOSE_URI),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
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
  ],
})
export class AppModule {}
