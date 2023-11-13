import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ObjectId } from 'mongodb';
import { HttpStatus } from '@nestjs/common';
import { CommentType } from '../dto/comment.dto';
import { CommentViewModel } from '../../../controllers/comments/models/comment-view.model';
import { PostsRepository } from '../../../infrastructure/repositories/posts.repository';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';
import { CommentsRepository } from '../../../infrastructure/repositories/comments.repository';

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
  ): Promise<CommentViewModel | number> {
    const { id, userId, content } = command;
    if (!ObjectId.isValid(id)) return HttpStatus.NOT_FOUND;
    if (!ObjectId.isValid(userId)) return HttpStatus.NOT_FOUND;
    const postObjectId = new ObjectId(id);
    const userObjectId = new ObjectId(userId);

    const foundPost = await this.postsRepository.findPostById(postObjectId);

    if (!foundPost) return HttpStatus.NOT_FOUND;

    const user = await this.usersRepository.findUserById(userObjectId);
    if (!user) return HttpStatus.NOT_FOUND;

    const newComment: CommentType = new CommentType(
      new ObjectId(),
      content,
      postObjectId,
      {
        userId: user.id,
        userLogin: user.login,
      },
      {
        likesCount: 0,
        dislikesCount: 0,
      },
      new Date().toISOString(),
    );

    return await this.commentsRepository.createComment(newComment);
  }
}
