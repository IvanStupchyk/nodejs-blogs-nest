import { Injectable } from '@nestjs/common';
import { Post, PostDocument } from '../../schemas/post.schema';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetSortedPostsModel } from '../../controllers/posts/models/get-sorted-posts.model';
import { PostsType } from '../../types/posts.types';
import { createDefaultSortedParams, getPagesCount } from '../../utils/utils';
import { mockPostModel } from '../../constants/blanks';
import { PostType } from '../../domains/posts/dto/post.dto';
import { PostLikesType } from '../../controllers/posts/models/post-likes.model';
import { getPostsMapper } from '../../utils/dataMappers/postsMappers/get-posts-mapper';
import { likeStatus } from '../../types/general.types';
import { PostViewModel } from '../../controllers/posts/models/post-view.model';
import { LikesRepository } from './likes.repository';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    private likesRepository: LikesRepository,
  ) {}
  async save(model: PostDocument) {
    return await model.save();
  }

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
        await this.likesRepository.fetchAllUserLikeByUserId(userId);
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
    return null;
    // const post = await this.PostModel.findOne(
    //   { id },
    //   { _id: 0, __v: 0 },
    // ).exec();
    //
    // return post
    //   ? {
    //       id: post.id,
    //       title: post.title,
    //       shortDescription: post.shortDescription,
    //       content: post.content,
    //       blogId: post.blogId,
    //       blogName: post.blogName,
    //       createdAt: post.createdAt,
    //       extendedLikesInfo: {
    //         likesCount: post.extendedLikesInfo.likesCount,
    //         dislikesCount: post.extendedLikesInfo.dislikesCount,
    //         myStatus: userLikeStatus,
    //         newestLikes: post.extendedLikesInfo.newestLikes
    //           .sort(
    //             (a: any, b: any) =>
    //               new Date(b.addedAt).valueOf() - new Date(a.addedAt).valueOf(),
    //           )
    //           .slice(0, 3)
    //           .map((l) => {
    //             return {
    //               login: l.login,
    //               userId: l.userId,
    //               addedAt: l.addedAt,
    //             };
    //           }),
    //       },
    //     }
    //   : null;
  }

  async findPostById(id: ObjectId): Promise<PostDocument | null> {
    return this.PostModel.findOne({ id });
  }

  async deleteUserLikeInfo(id: ObjectId, userId: ObjectId): Promise<boolean> {
    return !!(await this.PostModel.updateOne(
      { id },
      {
        $pull: {
          'extendedLikesInfo.newestLikes': { userId },
        },
      },
    ).exec());
  }

  async deletePost(id: ObjectId): Promise<boolean> {
    const deletedPost = await this.PostModel.deleteOne({ id }).exec();

    return deletedPost.deletedCount === 1;
  }
}
