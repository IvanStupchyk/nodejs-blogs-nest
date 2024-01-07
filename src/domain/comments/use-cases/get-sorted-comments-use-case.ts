import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '../../../infrastructure/jwt.service';
import { CommentsQueryDto } from '../../../application/dto/comments/comments.query.dto';
import { CommentsRepository } from '../../../infrastructure/repositories/comments/comments.repository';
import { isUUID } from '../../../utils/utils';
import { PostsRepository } from '../../../infrastructure/repositories/posts/posts.repository';
import { CommentsViewType } from '../../../types/comments.types';

export class GetSortedCommentsCommand {
  constructor(
    public id: string,
    public query: CommentsQueryDto,
    public userId: string,
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
  ): Promise<CommentsViewType | boolean> {
    const { id, userId, query } = command;

    if (!isUUID(id)) return false;

    const foundPost = await this.postsRepository.findPostById(id);
    if (!foundPost) return false;

    return await this.commentsRepository.getSortedComments(query, id, userId);
  }
}
