import { NewPostDto } from '../../../dtos/posts/new-post.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsService } from '../posts.service';
import { PostViewModel } from '../../../controllers/posts/models/post-view.model';

export class CreatePostCommand {
  constructor(public postData: NewPostDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(private readonly postsService: PostsService) {}

  async execute(command: CreatePostCommand): Promise<PostViewModel> {
    return await this.postsService.createPost(command.postData);
  }
}
