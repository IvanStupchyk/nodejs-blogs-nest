import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostViewType } from '../../../types/post-view.type';
import { isUUID } from '../../../utils/utils';
import { PostsRepository } from '../../../infrastructure/repositories/posts.repository';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '../../../infrastructure/jwt.service';

export class GetPostByIdCommand {
  constructor(
    public id: string,
    public accessTokenHeader: string | undefined,
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

    let userId = uuidv4();
    if (command.accessTokenHeader) {
      const accessToken = command.accessTokenHeader.split(' ')[1];
      userId = await this.jwtService.getUserIdByAccessToken(accessToken);
    }

    return await this.postsRepository.getPost(command.id, userId);
  }
}
