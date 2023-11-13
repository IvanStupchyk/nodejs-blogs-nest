import { Injectable } from '@nestjs/common';
import { PostViewModel } from '../../controllers/posts/models/post-view.model';
import { PostsRepository } from '../../infrastructure/repositories/posts.repository';
import { likeStatus } from '../../types/general.types';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../schemas/post.schema';
import { NewPostDto } from '../../dtos/posts/new-post.dto';
import { BlogsRepository } from '../../infrastructure/repositories/blogs.repository';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
    @InjectModel(Post.name) private PostModel: PostModelType,
  ) {}

  async createPost(postData: NewPostDto): Promise<PostViewModel> {
    const { title, content, shortDescription, blogId } = postData;
    const blog = await this.blogsRepository.findBlogById(blogId);

    const initialPostModel = this.PostModel.createPost(
      title,
      shortDescription,
      content,
      blogId,
      blog.name,
      this.PostModel,
    );

    await this.postsRepository.save(initialPostModel);

    return {
      id: initialPostModel.id,
      title: initialPostModel.title,
      content: initialPostModel.content,
      shortDescription: initialPostModel.shortDescription,
      blogId: initialPostModel.blogId,
      createdAt: initialPostModel.createdAt,
      blogName: initialPostModel.blogName,
      extendedLikesInfo: {
        likesCount: initialPostModel.extendedLikesInfo.likesCount,
        dislikesCount: initialPostModel.extendedLikesInfo.dislikesCount,
        myStatus: likeStatus.None,
        newestLikes: initialPostModel.extendedLikesInfo.newestLikes,
      },
    };
  }
}
