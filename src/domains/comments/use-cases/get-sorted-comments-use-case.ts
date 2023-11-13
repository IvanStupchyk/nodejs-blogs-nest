import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ObjectId } from 'mongodb';
import { CommentsRepository } from '../../../infrastructure/repositories/comments.repository';
import { CommentsType } from '../../../types/general.types';
import { JwtService } from '../../../infrastructure/jwt.service';
import { GetSortedCommentsModel } from '../../../controllers/comments/models/get-sorted-comments.model';
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

    if (!ObjectId.isValid(id)) return false;
    const postObjectId = new ObjectId(id);

    const foundPost = await this.postsRepository.findPostById(postObjectId);
    if (!foundPost) return false;

    let userId;
    if (accessTokenHeader) {
      const accessToken = accessTokenHeader.split(' ')[1];
      userId = await this.jwtService.getUserIdByAccessToken(accessToken);
    }

    return await this.commentsRepository.getSortedComments(
      query,
      postObjectId,
      userId,
    );
  }
}
