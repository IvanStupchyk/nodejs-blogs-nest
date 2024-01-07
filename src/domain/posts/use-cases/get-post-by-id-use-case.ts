import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isUUID } from '../../../utils/utils';
import { PostsRepository } from '../../../infrastructure/repositories/posts/posts.repository';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '../../../infrastructure/jwt.service';
import { PostViewType } from '../../../types/posts/posts.types';

export class GetPostByIdCommand {
  constructor(
    public id: string,
    public userId: string,
  ) {}
}

@CommandHandler(GetPostByIdCommand)
export class GetPostByIdUseCase implements ICommandHandler<GetPostByIdCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: GetPostByIdCommand): Promise<PostViewType | null> {
    if (!isUUID(command.id)) return null;

    return await this.postsRepository.getPost(command.id, command.userId);
  }
}
