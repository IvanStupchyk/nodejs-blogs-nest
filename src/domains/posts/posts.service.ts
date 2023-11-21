import { Injectable } from '@nestjs/common';
import { PostViewModel } from '../../controllers/posts/models/post-view.model';
import { NewPostDto } from '../../dtos/posts/new-post.dto';
import { BlogsSqlRepository } from '../../infrastructure/repositories-raw-sql/blogs-sql.repository';
import { PostModel } from '../../controllers/posts/models/Post.model';
import { v4 as uuidv4 } from 'uuid';
import { PostsSqlRepository } from '../../infrastructure/repositories-raw-sql/posts-sql.repository';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly blogsSqlRepository: BlogsSqlRepository,
  ) {}

  async createPost(postData: NewPostDto): Promise<PostViewModel> {
    const { title, content, shortDescription, blogId } = postData;
    const blog = await this.blogsSqlRepository.findBlogById(blogId);

    const initialPostModel: PostModel = new PostModel(
      uuidv4(),
      title,
      shortDescription,
      content,
      blogId,
      blog.name,
      new Date().toISOString(),
    );

    return await this.postsSqlRepository.createPost(initialPostModel);
  }
}
