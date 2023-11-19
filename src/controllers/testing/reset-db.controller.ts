import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostDocument, Post } from '../../schemas/post.schema';
import { Blog, BlogDocument } from '../../schemas/blog.schema';
import { CommentDocument, Comment } from '../../schemas/comment.schema';
import { PostLikes, PostLikesDocument } from '../../schemas/post-likes.schema';
import {
  ApiRequest,
  ApiRequestDocument,
} from '../../schemas/api-request.schema';
import { RouterPaths } from '../../constants/router.paths';
import { UsersQuerySqlRepository } from '../../infrastructure/repositories-raw-sql/users-query-sql.repository';
import { DevicesSqlRepository } from '../../infrastructure/repositories-raw-sql/devices-sql.repository';
import { InvalidRefreshTokensSqlRepository } from '../../infrastructure/repositories-raw-sql/invalid-refresh-tokens-sql.repository';
import { BlogsSqlRepository } from '../../infrastructure/repositories-raw-sql/blogs-sql.repository';
import { PostsSqlRepository } from '../../infrastructure/repositories-raw-sql/posts-sql.repository';

@Controller()
export class ResetDbController {
  constructor(
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
    private readonly usersQuerySqlRepository: UsersQuerySqlRepository,
    private readonly devicesSqlRepository: DevicesSqlRepository,
    private readonly invalidRefreshTokensSqlRepository: InvalidRefreshTokensSqlRepository,
    private readonly blogsSqlRepository: BlogsSqlRepository,
    private readonly postsSqlRepository: PostsSqlRepository,
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
    @InjectModel(ApiRequest.name)
    private ApiRequestModel: Model<ApiRequestDocument>,
    @InjectModel(PostLikes.name)
    private PostLikesModel: Model<PostLikesDocument>,
  ) {}

  @Delete(`${RouterPaths.testing}/all-data`)
  @HttpCode(204)
  async resetDb() {
    await this.PostModel.deleteMany();
    await this.BlogModel.deleteMany();
    await this.usersQuerySqlRepository.deleteAllUsers();
    await this.devicesSqlRepository.deleteAllSessions();
    await this.invalidRefreshTokensSqlRepository.deleteInvalidRefreshTokens();
    await this.blogsSqlRepository.deleteAllBlogs();
    await this.postsSqlRepository.deleteAllPosts();
    await this.CommentModel.deleteMany();
    await this.PostLikesModel.deleteMany();
    await this.ApiRequestModel.deleteMany();
  }
}
