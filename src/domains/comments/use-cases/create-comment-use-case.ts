import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { CommentModel } from '../dto/comment.dto';
import { CommentViewModel } from '../../../controllers/comments/models/comment-view.model';
import { CommentsSqlRepository } from '../../../infrastructure/repositories-raw-sql/comments-sql.repository';
import { v4 as uuidv4 } from 'uuid';
import { isUUID } from '../../../utils/utils';
import { PostsSqlRepository } from '../../../infrastructure/repositories-raw-sql/posts-sql.repository';
import { UsersSqlRepository } from '../../../infrastructure/repositories-raw-sql/users-sql.repository';

export class CreateCommentCommand {
  constructor(
    public content: string,
    public id: string,
    public userId: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly commentsSqlRepository: CommentsSqlRepository,
  ) {}

  async execute(
    command: CreateCommentCommand,
  ): Promise<CommentViewModel | number> {
    const { id, userId, content } = command;
    if (!isUUID(id)) return HttpStatus.NOT_FOUND;

    const foundPost = await this.postsSqlRepository.findPostById(id);
    if (!foundPost) return HttpStatus.NOT_FOUND;

    const user = await this.usersSqlRepository.fetchAllUserDataById(userId);
    if (!user) return HttpStatus.NOT_FOUND;

    const newComment = new CommentModel(
      uuidv4(),
      content,
      id,
      user.id,
      user.login,
      new Date().toISOString(),
    );

    return await this.commentsSqlRepository.createComment(newComment);
  }
}
