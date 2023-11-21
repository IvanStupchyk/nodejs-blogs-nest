import { Controller, Delete, HttpCode } from '@nestjs/common';
import { RouterPaths } from '../../constants/router.paths';
import { UsersQuerySqlRepository } from '../../infrastructure/repositories-raw-sql/users-query-sql.repository';
import { DevicesSqlRepository } from '../../infrastructure/repositories-raw-sql/devices-sql.repository';
import { InvalidRefreshTokensSqlRepository } from '../../infrastructure/repositories-raw-sql/invalid-refresh-tokens-sql.repository';
import { BlogsSqlRepository } from '../../infrastructure/repositories-raw-sql/blogs-sql.repository';
import { PostsSqlRepository } from '../../infrastructure/repositories-raw-sql/posts-sql.repository';
import { CommentsSqlRepository } from '../../infrastructure/repositories-raw-sql/comments-sql.repository';
import { PostLikesSqlRepository } from '../../infrastructure/repositories-raw-sql/post-likes-sql.repository';
import { CommentLikesSqlRepository } from '../../infrastructure/repositories-raw-sql/comment-likes-sql.repository';

@Controller()
export class ResetDbController {
  constructor(
    private readonly usersQuerySqlRepository: UsersQuerySqlRepository,
    private readonly devicesSqlRepository: DevicesSqlRepository,
    private readonly invalidRefreshTokensSqlRepository: InvalidRefreshTokensSqlRepository,
    private readonly blogsSqlRepository: BlogsSqlRepository,
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly commentsSqlRepository: CommentsSqlRepository,
    private readonly postLikesSqlRepository: PostLikesSqlRepository,
    private readonly commentLikesSqlRepository: CommentLikesSqlRepository,
  ) {}

  @Delete(`${RouterPaths.testing}/all-data`)
  @HttpCode(204)
  async resetDb() {
    await this.usersQuerySqlRepository.deleteAllUsers();
    await this.devicesSqlRepository.deleteAllSessions();
    await this.invalidRefreshTokensSqlRepository.deleteInvalidRefreshTokens();
    await this.blogsSqlRepository.deleteAllBlogs();
    await this.postsSqlRepository.deleteAllPosts();
    await this.commentsSqlRepository.deleteAllComments();
    await this.postLikesSqlRepository.deleteAllPostLikes();
    await this.commentLikesSqlRepository.deleteAllCommentLikes();
  }
}
