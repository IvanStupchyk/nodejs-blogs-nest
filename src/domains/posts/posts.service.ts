import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogsQueryRepository } from '../../infrastructure/repositories/blogs-query.repository';
import { PostType } from './dto/post.dto';
import { GetSortedPostsModel } from '../../controllers/posts/models/get-sorted-posts.model';
import { PostViewModel } from '../../controllers/posts/models/post-view.model';
import { likesCounter } from '../../utils/likes-counter';
import { LikesQueryRepository } from '../../infrastructure/repositories/likes-query.repository';
import { LikesRepository } from '../../infrastructure/repositories/likes.repository';
import { PostLikeUserInfoType } from '../../types/posts-likes.types';
import { PostsRepository } from '../../infrastructure/repositories/posts.repository';
import { likeStatus } from '../../types/general.types';
import { PostsQueryRepository } from '../../infrastructure/repositories/posts-query.repository';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../schemas/post.schema';
import { PostLikeModelType, PostLikes } from '../../schemas/post-likes.schema';
import { NewPostDto } from '../../controllers/posts/models/new-post.dto';
import { errorsConstants } from '../../constants/errors.contants';
import { errorMessageGenerator } from '../../utils/error-message-generator';
import { PostForSpecificBlogDto } from '../../controllers/posts/models/post-for-specific-blog.dto';
import { BlogsService } from '../blogs/blogs.service';
import { JwtService } from '../../infrastructure/jwt.service';
import { UsersQueryRepository } from '../../infrastructure/repositories/users-query.repository';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsRepository: PostsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly likesQueryRepository: LikesQueryRepository,
    private readonly likesRepository: LikesRepository,
    private readonly blogsService: BlogsService,
    private readonly jwtService: JwtService,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(PostLikes.name) private PostLikeModel: PostLikeModelType,
  ) {}

  async createPost(postData: NewPostDto): Promise<PostViewModel> {
    const { title, content, shortDescription, blogId } = postData;
    const blog = await this.blogsQueryRepository.findBlogById(blogId);

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

  async createPostForSpecifiedBlog(
    postData: PostForSpecificBlogDto,
    blogId: string,
  ): Promise<PostViewModel> {
    const { title, content, shortDescription } = postData;

    const foundBlog = await this.blogsService.findBlogById(blogId);

    if (!foundBlog) {
      throw new NotFoundException();
    }

    return await this.createPost({
      title,
      content,
      shortDescription,
      blogId: new ObjectId(blogId),
    });
  }

  async updatePostById(
    id: string,
    title: string,
    content: string,
    shortDescription: string,
    blogId: ObjectId,
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
  ): Promise<boolean> {
    if (!likeStatus[myStatus]) {
      errorMessageGenerator([
        { field: 'likeStatus', message: errorsConstants.likeStatus },
      ]);
    }

    if (!ObjectId.isValid(id)) return false;
    const postObjectId = new ObjectId(id);
    const foundPost =
      await this.postsQueryRepository.findPostById(postObjectId);
    if (!foundPost) return false;

    const user = await this.usersQueryRepository.findUserById(userId);
    if (!user) return false;

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
        login: user.login,
      };
      foundPost.setNewUserPostLike(userPostLikeViewInfo);
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
      userId = await this.jwtService.getUserIdByAccessToken(accessToken);
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
      userId = await this.jwtService.getUserIdByAccessToken(accessToken);
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
