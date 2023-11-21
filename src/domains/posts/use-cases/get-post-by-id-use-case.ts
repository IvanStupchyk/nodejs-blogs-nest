import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostViewModel } from '../../../controllers/posts/models/post-view.model';
import { isUUID } from '../../../utils/utils';
import { PostsSqlRepository } from '../../../infrastructure/repositories-raw-sql/posts-sql.repository';
import { v4 as uuidv4 } from 'uuid';

export class GetPostByIdCommand {
  constructor(
    public id: string,
    public userId: string,
  ) {}
}

@CommandHandler(GetPostByIdCommand)
export class GetPostByIdUseCase implements ICommandHandler<GetPostByIdCommand> {
  constructor(private readonly postsSqlRepository: PostsSqlRepository) {}

  async execute(command: GetPostByIdCommand): Promise<PostViewModel | null> {
    if (!isUUID(command.id)) return null;
    let userId = command.userId;

    if (!command.userId || !isUUID(command.userId)) {
      userId = uuidv4();
    }

    return await this.postsSqlRepository.getPost(command.id, userId);
  }
}
