import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { CommentsRepository } from '../../../infrastructure/repositories/comments.repository';
import { isUUID } from '../../../utils/utils';
import { PostsRepository } from '../../../infrastructure/repositories/posts.repository';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';
import { CommentViewType } from '../../../types/comments.types';
import { Comment } from '../../../entities/comments/Comment.entity';
import { likeStatus } from '../../../types/general.types';

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

    const newComment = new Comment();
    newComment.content = content;
    newComment.user = user;
    newComment.post = foundPost;

    const savedComment = await this.commentsRepository.save(newComment);

    return {
      id: savedComment.id,
      content: savedComment.content,
      commentatorInfo: {
        userId: user.id,
        userLogin: user.login,
      },
      createdAt: savedComment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: likeStatus.None,
      },
    };
  }
}
