import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isUUID } from '../../../utils/utils';
import { PostsRepository } from '../../../infrastructure/repositories/posts/posts.repository';
import { UsersRepository } from '../../../infrastructure/repositories/users/users.repository';
import { CommentViewType } from '../../../types/comments.types';
import { Comment } from '../../../entities/comments/Comment.entity';
import { likeStatus } from '../../../types/general.types';
import { DataSourceRepository } from '../../../infrastructure/repositories/transactions/data-source.repository';

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
    private readonly dataSourceRepository: DataSourceRepository,
  ) {}

  async execute(
    command: CreateCommentCommand,
  ): Promise<CommentViewType | null> {
    const { id, userId, content } = command;
    if (!isUUID(id)) return null;

    const foundPost = await this.postsRepository.findPostById(id);
    if (!foundPost) return null;

    const user = await this.usersRepository.fetchAllUserDataById(userId);
    if (!user) return null;

    const newComment = new Comment();
    newComment.content = content;
    newComment.user = user;
    newComment.post = foundPost;

    const savedComment = await this.dataSourceRepository.save(newComment);

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
