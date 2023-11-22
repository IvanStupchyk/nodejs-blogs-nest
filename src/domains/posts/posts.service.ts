import { Injectable } from '@nestjs/common';
import { PostViewModel } from '../../controllers/posts/models/post-view.model';
import { NewPostDto } from '../../dtos/posts/new-post.dto';
import { BlogsRepository } from '../../infrastructure/repositories/blogs.repository';
import { PostModel } from '../../controllers/posts/models/Post.model';
import { v4 as uuidv4 } from 'uuid';
import { PostsRepository } from '../../infrastructure/repositories/posts.repository';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async createPost(postData: NewPostDto): Promise<PostViewModel> {
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
