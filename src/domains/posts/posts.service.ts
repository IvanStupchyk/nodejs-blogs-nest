import { Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from '../../repositories/blogs.query.repository';
import { PostType } from './dto/post.dto';
import { GetSortedPostsModel } from '../../controllers/posts/models/GetSortedPostsModel';
import { PostViewModel } from '../../controllers/posts/models/PostViewModel';
import { likesCounter } from '../../utils/likesCounter';
import { LikesQueryRepository } from '../../repositories/likes.query.repository';
import { LikesRepository } from '../../repositories/likesRepository';
import { PostLikeUserInfoType } from '../../types/postsLikesTypes';
import { PostsRepository } from '../../repositories/postsRepository';
import { likeStatus } from '../../types/generalTypes';
import { PostsQueryRepository } from '../../repositories/posts.query.repository';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../schemas/post.schema';
import { PostLikeModelType, PostLikes } from '../../schemas/post.likes.schema';
import { jwtService } from '../../application/jwt.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsRepository: PostsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly likesQueryRepository: LikesQueryRepository,
    private readonly likesRepository: LikesRepository,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(PostLikes.name) private PostLikeModel: PostLikeModelType,
  ) {}

  async createPost(
    title: string,
    content: string,
    shortDescription: string,
    blogId: ObjectId,
  ): Promise<PostViewModel> {
    const blog = await this.blogsQueryRepository.findBlogById(blogId);

    if (!blog) {
      return null;
    }
    const initialPostModel = this.PostModel.createPost(
      title,
      shortDescription,
      content,
      blogId,
      blog?.name ?? '',
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

  async updatePostById(
    id: string,
    title: string,
    content: string,
    shortDescription: string,
    blogId: string,
  ): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    if (!ObjectId.isValid(blogId)) return false;

    const post = await this.postsQueryRepository.findPostById(new ObjectId(id));
    if (!post) return false;

    post.updatePost(title, content, shortDescription);

    await this.postsRepository.save(post);
    return true;
  }

  async changeLikesCount(
    id: string,
    myStatus: string,
    userId: ObjectId,
    login: string,
  ): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const postObjectId = new ObjectId(id);
    const foundPost =
      await this.postsQueryRepository.findPostById(postObjectId);
    if (!foundPost) return false;

    const userPostLike =
      await this.likesQueryRepository.findPostLikeByUserIdAndPostId(
        userId,
        postObjectId,
      );
    const initialStatus = userPostLike?.myStatus;

    if (initialStatus === myStatus) return true;

    const { likesInfo, newStatus } = likesCounter(
      myStatus,
      likeStatus.None,
      initialStatus,
      {
        likesCount: foundPost.extendedLikesInfo.likesCount,
        dislikesCount: foundPost.extendedLikesInfo.dislikesCount,
      },
    );

    if (userPostLike) {
      userPostLike.updateExistingPostLike(newStatus);
      await this.likesRepository.save(userPostLike);
    } else {
      const postLike = this.PostLikeModel.createPostLike(
        userId,
        postObjectId,
        newStatus,
        this.PostLikeModel,
      );
      await this.likesRepository.save(postLike);
    }

    if (newStatus === likeStatus.Like) {
      const userPostLikeViewInfo: PostLikeUserInfoType = {
        addedAt: new Date().toISOString(),
        userId,
        login,
      };

      await this.postsRepository.addNewUserLikeInfo(
        postObjectId,
        userPostLikeViewInfo,
      );
    }

    if (newStatus === likeStatus.None || newStatus === likeStatus.Dislike) {
      await this.postsRepository.deleteUserLikeInfo(postObjectId, userId);
    }

    foundPost.changeLikesCount(likesInfo.likesCount, likesInfo.dislikesCount);
    await this.postsRepository.save(foundPost);
    return true;
  }

  async findPostById(id: string): Promise<PostType | null> {
    if (!ObjectId.isValid(id)) return null;
    return await this.postsQueryRepository.findPostByIdWithoutMongoId(
      new ObjectId(id),
    );
  }

  async getSortedPosts(
    params: GetSortedPostsModel,
    accessTokenHeader: string | undefined,
  ): Promise<any> {
    let userId;
    if (accessTokenHeader) {
      const accessToken = accessTokenHeader.split(' ')[1];
      userId = await jwtService.getUserIdByAccessToken(accessToken);
    }

    return await this.postsQueryRepository.getSortedPosts(params, userId);
  }

  async getPostById(
    id: string,
    accessTokenHeader: string | undefined,
  ): Promise<PostViewModel | null> {
    if (!ObjectId.isValid(id)) return null;
    const objectPostId = new ObjectId(id);

    let userId;
    if (accessTokenHeader) {
      const accessToken = accessTokenHeader.split(' ')[1];
      userId = await jwtService.getUserIdByAccessToken(accessToken);
    }

    let userLikeStatus = likeStatus.None;

    if (userId) {
      const userCommentsLikes =
        await this.likesQueryRepository.findPostLikeByUserIdAndPostId(
          userId,
          objectPostId,
        );

      if (userCommentsLikes) userLikeStatus = userCommentsLikes.myStatus;
    }

    return await this.postsQueryRepository.getPost(
      objectPostId,
      userLikeStatus,
    );
  }

  async deletePost(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    return await this.postsRepository.deletePost(new ObjectId(id));
  }
}
