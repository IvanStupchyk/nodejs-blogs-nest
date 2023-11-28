import { Controller, Delete, HttpCode } from '@nestjs/common';
import { RouterPaths } from '../constants/router.paths';
import { UsersQueryRepository } from '../infrastructure/repositories/users-query.repository';
import { DevicesRepository } from '../infrastructure/repositories/devices.repository';
import { InvalidRefreshTokensRepository } from '../infrastructure/repositories/invalid-refresh-tokens.repository';
import { BlogsRepository } from '../infrastructure/repositories/blogs.repository';
import { PostsRepository } from '../infrastructure/repositories/posts.repository';
import { CommentsRepository } from '../infrastructure/repositories/comments.repository';
import { PostLikesRepository } from '../infrastructure/repositories/post-likes.repository';
import { CommentLikesRepository } from '../infrastructure/repositories/comment-likes.repository';

@Controller()
export class ResetDbController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly devicesRepository: DevicesRepository,
    private readonly invalidRefreshTokensRepository: InvalidRefreshTokensRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly postLikesRepository: PostLikesRepository,
    private readonly commentLikesRepository: CommentLikesRepository,
  ) {}

  @Delete(`${RouterPaths.testing}/all-data`)
  @HttpCode(204)
  async resetDb() {
    await this.usersQueryRepository.deleteAllUsers();
    await this.devicesRepository.deleteAllSessions();
    await this.invalidRefreshTokensRepository.deleteInvalidRefreshTokens();
    await this.blogsRepository.deleteAllBlogs();
    await this.postsRepository.deleteAllPosts();
    // await this.commentsRepository.deleteAllComments();
    // await this.postLikesRepository.deleteAllPostLikes();
    // await this.commentLikesRepository.deleteAllCommentLikes();
  }
}
