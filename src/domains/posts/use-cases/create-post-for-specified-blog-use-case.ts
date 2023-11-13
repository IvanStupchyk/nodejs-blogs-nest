import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsService } from '../posts.service';
import { PostViewModel } from '../../../controllers/posts/models/post-view.model';
import { NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { PostForSpecificBlogDto } from '../../../dtos/posts/post-for-specific-blog.dto';
import { BlogsService } from '../../blogs/blogs.service';

export class CreatePostForSpecifiedBlogCommand {
  constructor(
    public postData: PostForSpecificBlogDto,
    public blogId: string,
  ) {}
}

@CommandHandler(CreatePostForSpecifiedBlogCommand)
export class CreatePostForSpecifiedBlogUseCase
  implements ICommandHandler<CreatePostForSpecifiedBlogCommand>
{
  constructor(
    private readonly postsService: PostsService,
    private readonly blogsService: BlogsService,
  ) {}

  async execute(
    command: CreatePostForSpecifiedBlogCommand,
  ): Promise<PostViewModel> {
    const { title, content, shortDescription } = command.postData;

    const foundBlog = await this.blogsService.findBlogById(command.blogId);

    if (!foundBlog) {
      throw new NotFoundException();
    }

    return await this.postsService.createPost({
      title,
      content,
      shortDescription,
      blogId: new ObjectId(command.blogId),
    });
  }
}
