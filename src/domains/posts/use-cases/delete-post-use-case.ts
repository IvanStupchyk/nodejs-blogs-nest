import { HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsSqlRepository } from '../../../infrastructure/repositories-raw-sql/posts-sql.repository';
import { isUUID } from '../../../utils/utils';
import { PostLikesSqlRepository } from '../../../infrastructure/repositories-raw-sql/post-likes-sql.repository';

export class DeletePostCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly postLikesSqlRepository: PostLikesSqlRepository,
  ) {}

  async execute(command: DeletePostCommand): Promise<number> {
    if (!isUUID(command.id)) return HttpStatus.NOT_FOUND;
    const isDeleted = await this.postsSqlRepository.deletePost(command.id);
    await this.postLikesSqlRepository.deleteAllPostLikesAndDislikes(command.id);

    return isDeleted ? HttpStatus.NO_CONTENT : HttpStatus.NOT_FOUND;
  }
}
