import { Injectable } from '@nestjs/common';
import { PostInputDto } from '../../dto/posts/post.input.dto';
import { BlogsRepository } from '../../infrastructure/repositories/blogs.repository';
import { PostsRepository } from '../../infrastructure/repositories/posts.repository';
import { PostViewType } from '../../types/posts.types';
import { Post } from '../../entities/posts/Post.entity';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async createPost(postData: PostInputDto): Promise<PostViewType> {
    const { title, content, shortDescription, blogId } = postData;
    const blog = await this.blogsRepository.findBlogById(blogId);

    const newPost = new Post();
    newPost.title = title;
    newPost.content = content;
    newPost.shortDescription = shortDescription;
    newPost.blogName = blog.name;
    newPost.blog = blog.id as any;

    return await this.postsRepository.createPost(newPost);
  }
}
