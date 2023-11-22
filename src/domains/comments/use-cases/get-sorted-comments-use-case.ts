import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsType } from '../../../types/general.types';
import { JwtService } from '../../../infrastructure/jwt.service';
import { GetSortedCommentsModel } from '../../../controllers/comments/models/get-sorted-comments.model';
import { CommentsRepository } from '../../../infrastructure/repositories/comments.repository';
import { isUUID } from '../../../utils/utils';
import { PostsRepository } from '../../../infrastructure/repositories/posts.repository';

export class GetSortedCommentsCommand {
  constructor(
    public id: string,
    public query: GetSortedCommentsModel,
    public accessTokenHeader: string | undefined,
  ) {}
}

@CommandHandler(GetSortedCommentsCommand)
export class GetSortedCommentsUseCase
  implements ICommandHandler<GetSortedCommentsCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly jwtService: JwtService,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute(
    command: GetSortedCommentsCommand,
  ): Promise<CommentsType | boolean> {
    const { id, accessTokenHeader, query } = command;

    if (!isUUID(id)) return false;

    const foundPost = await this.postsRepository.findPostById(id);
    if (!foundPost) return false;

    let userId;
    if (accessTokenHeader) {
      const accessToken = accessTokenHeader.split(' ')[1];
      userId = await this.jwtService.getUserIdByAccessToken(accessToken);
    }

    return await this.commentsRepository.getSortedComments(query, id, userId);
  }
}
