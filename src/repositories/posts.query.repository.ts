import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { createDefaultSortedParams, getPagesCount } from '../utils/utils';
import { GetSortedPostsModel } from '../controllers/posts/models/GetSortedPostsModel';
import { PostViewModel } from '../controllers/posts/models/PostViewModel';
import { LikesQueryRepository } from './likes.query.repository';
import { PostLikesType } from '../dtos/post.likes.dto';
import { mockPostModel } from '../constants/blanks';
import { likeStatus } from '../types/generalTypes';
import { getPostsMapper } from '../utils/dataMappers/postsMappers/getPostsMapper';
import { PostsType } from '../types/postsTypes';
import { PostType } from '../domains/posts/dto/post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../schemas/post.schema';

@Injectable()
export class PostsQueryRepository {
  constructor(
    private likesQueryRepository: LikesQueryRepository,
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
  ) {}

  async getSortedPosts(
    params: GetSortedPostsModel,
    userId: ObjectId | undefined,
  ): Promise<PostsType> {
    const { pageNumber, pageSize, skipSize, sortBy, sortDirection } =
      createDefaultSortedParams({
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        model: mockPostModel,
      });

    const posts: Array<PostType> = await this.PostModel.find(
      {},
      { _id: 0, __v: 0 },
    )
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip(skipSize)
      .limit(pageSize)
      .lean();

    const postsCount = await this.PostModel.countDocuments();

    const pagesCount = getPagesCount(postsCount, pageSize);

    let usersPostsLikes: Array<PostLikesType> | null = null;
    if (userId) {
      usersPostsLikes =
        await this.likesQueryRepository.fetchAllUserLikeByUserId(userId);
    }

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: postsCount,
      items: getPostsMapper(posts, usersPostsLikes),
    };
  }

  async findPostByIdWithoutMongoId(id: ObjectId): Promise<PostType | null> {
    return await this.PostModel.findOne({ id }, { _id: 0, __v: 0 }).exec();
  }

  async getPost(
    id: ObjectId,
    userLikeStatus: likeStatus,
  ): Promise<PostViewModel | null> {
    const post = await this.PostModel.findOne(
      { id },
      { _id: 0, __v: 0 },
    ).exec();

    return post
      ? {
          id: post.id,
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId,
          blogName: post.blogName,
          createdAt: post.createdAt,
          extendedLikesInfo: {
            likesCount: post.extendedLikesInfo.likesCount,
            dislikesCount: post.extendedLikesInfo.dislikesCount,
            myStatus: userLikeStatus,
            newestLikes: post.extendedLikesInfo.newestLikes
              .sort(
                (a: any, b: any) =>
                  new Date(b.addedAt).valueOf() - new Date(a.addedAt).valueOf(),
              )
              .slice(0, 3),
          },
        }
      : null;
  }

  async findPostById(id: ObjectId): Promise<PostDocument | null> {
    return this.PostModel.findOne({ id });
  }

  async findPostsByIdForSpecificBlog(
    params: GetSortedPostsModel,
    id: string,
    userId: ObjectId | undefined,
  ): Promise<PostsType | null> {
    const { pageNumber, pageSize, skipSize, sortBy, sortDirection } =
      createDefaultSortedParams({
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        model: mockPostModel,
      });

    const posts = await this.PostModel.find({ blogId: id }, { _id: 0, __v: 0 })
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip(skipSize)
      .limit(pageSize)
      .lean();

    const postsCount = await this.PostModel.countDocuments({ blogId: id });

    const pagesCount = getPagesCount(postsCount, pageSize);

    let usersPostsLikes: Array<PostLikesType> | null = null;
    if (userId) {
      usersPostsLikes =
        await this.likesQueryRepository.fetchAllUserLikeByUserId(userId);
    }

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: postsCount,
      items: getPostsMapper(posts, usersPostsLikes),
    };
  }
}
