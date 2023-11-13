import { HttpStatus } from '@nestjs/common';
import { PostsRepository } from '../../../infrastructure/repositories/posts.repository';
import { ObjectId } from 'mongodb';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeletePostCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: DeletePostCommand): Promise<number> {
    if (!ObjectId.isValid(command.id)) return HttpStatus.NOT_FOUND;
    const isDeleted = await this.postsRepository.deletePost(
      new ObjectId(command.id),
    );

    return isDeleted ? HttpStatus.NO_CONTENT : HttpStatus.NOT_FOUND;
  }
}
