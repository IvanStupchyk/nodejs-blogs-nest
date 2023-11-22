import { Injectable } from '@nestjs/common';
import { PostViewType } from '../../types/post-view.type';
import { PostInputDto } from '../../dto/posts/post.input.dto';
import { BlogsRepository } from '../../infrastructure/repositories/blogs.repository';
import { PostModel } from '../../models/posts/Post.model';
import { v4 as uuidv4 } from 'uuid';
import { PostsRepository } from '../../infrastructure/repositories/posts.repository';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async createPost(postData: PostInputDto): Promise<PostViewType> {
    const { title, content, shortDescription, blogId } = postData;
    const blog = await this.blogsRepository.findBlogById(blogId);

    const initialPostModel: PostModel = new PostModel(
      uuidv4(),
      title,
      shortDescription,
      content,
      blogId,
      blog.name,
      new Date().toISOString(),
    );

    return await this.postsRepository.createPost(initialPostModel);
  }
}
