import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PostForSpecifiedBlogInputDto } from '../../../dto/posts/post-for-specified-blog.input.dto';
import { isUUID } from '../../../utils/utils';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs.repository';
import { PostViewType } from '../../../types/posts.types';
import { Post } from '../../../entities/posts/Post.entity';
import { PostsRepository } from '../../../infrastructure/repositories/posts.repository';

export class CreatePostCommand {
  constructor(
    public postData: PostForSpecifiedBlogInputDto,
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<PostViewType> {
    const { title, content, shortDescription } = command.postData;

    if (!isUUID(command.blogId)) return null;
    const foundBlog = await this.blogsRepository.findBlogById(command.blogId);

    if (!foundBlog) {
      throw new NotFoundException();
    }
    // if (foundBlog && foundBlog.userId !== command.userId) {
    //   throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    // }

    const newPost = new Post();
    newPost.title = title;
    newPost.content = content;
    newPost.shortDescription = shortDescription;
    newPost.blogName = foundBlog.name;
    newPost.blog = foundBlog;

    return await this.postsRepository.createPost(newPost);
  }
}
