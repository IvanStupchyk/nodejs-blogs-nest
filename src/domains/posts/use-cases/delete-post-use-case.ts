import { HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../infrastructure/repositories/posts.repository';
import { isUUID } from '../../../utils/utils';
import { PostLikesRepository } from '../../../infrastructure/repositories/post-likes.repository';

export class DeletePostCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly postLikesRepository: PostLikesRepository,
  ) {}

  async execute(command: DeletePostCommand): Promise<number> {
    if (!isUUID(command.id)) return HttpStatus.NOT_FOUND;
    const isDeleted = await this.postsRepository.deletePost(command.id);
    await this.postLikesRepository.deleteAllPostLikesAndDislikes(command.id);

    return isDeleted ? HttpStatus.NO_CONTENT : HttpStatus.NOT_FOUND;
  }
}
