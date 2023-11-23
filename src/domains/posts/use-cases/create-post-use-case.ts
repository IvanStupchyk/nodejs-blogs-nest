import { PostInputDto } from '../../../dto/posts/post.input.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsService } from '../posts.service';
import { PostViewType } from '../../../types/posts.types';

export class CreatePostCommand {
  constructor(public postData: PostInputDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(private readonly postsService: PostsService) {}

  async execute(command: CreatePostCommand): Promise<PostViewType> {
    return await this.postsService.createPost(command.postData);
  }
}
