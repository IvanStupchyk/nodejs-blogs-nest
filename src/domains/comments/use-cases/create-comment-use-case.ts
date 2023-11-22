import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { CommentModel } from '../../../models/comments/Comment.model';
import { CommentViewType } from '../../../types/comment-view.type';
import { CommentsRepository } from '../../../infrastructure/repositories/comments.repository';
import { v4 as uuidv4 } from 'uuid';
import { isUUID } from '../../../utils/utils';
import { PostsRepository } from '../../../infrastructure/repositories/posts.repository';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';

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
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute(
    command: CreateCommentCommand,
  ): Promise<CommentViewType | number> {
    const { id, userId, content } = command;
    if (!isUUID(id)) return HttpStatus.NOT_FOUND;

    const foundPost = await this.postsRepository.findPostById(id);
    if (!foundPost) return HttpStatus.NOT_FOUND;

    const user = await this.usersRepository.fetchAllUserDataById(userId);
    if (!user) return HttpStatus.NOT_FOUND;

    const newComment = new CommentModel(
      uuidv4(),
      content,
      id,
      user.id,
      user.login,
      new Date().toISOString(),
    );

    return await this.commentsRepository.createComment(newComment);
  }
}
