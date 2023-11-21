import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetSortedPostsModel } from '../../../controllers/posts/models/get-sorted-posts.model';
import { PostsSqlRepository } from '../../../infrastructure/repositories-raw-sql/posts-sql.repository';
import { isUUID } from '../../../utils/utils';
import { v4 as uuidv4 } from 'uuid';

export class GetSortedPostsCommand {
  constructor(
    public params: GetSortedPostsModel,
    public userId: string | undefined,
  ) {}
}

@CommandHandler(GetSortedPostsCommand)
export class GetSortedPostsUseCase
  implements ICommandHandler<GetSortedPostsCommand>
{
  constructor(private readonly postsSqlRepository: PostsSqlRepository) {}

  async execute(command: GetSortedPostsCommand): Promise<any> {
    let userId = command.userId;

    if (!command.userId || !isUUID(command.userId)) {
      userId = uuidv4();
    }

    return await this.postsSqlRepository.getSortedPosts(command.params, userId);
  }
}
