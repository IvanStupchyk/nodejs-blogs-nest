import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { createDefaultSortedParams, getPagesCount } from '../../utils/utils';
import { GetSortedPostsModel } from '../../controllers/posts/models/get-sorted-posts.model';
import { PostLikesType } from '../../dtos/post-likes.dto';
import { mockPostModel } from '../../constants/blanks';
import { getPostsMapper } from '../../utils/dataMappers/postsMappers/get-posts-mapper';
import { PostsType } from '../../types/posts.types';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../../schemas/post.schema';
import { LikesRepository } from './likes.repository';

@Injectable()
export class PostsQueryRepository {
  constructor(
    private likesRepository: LikesRepository,
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
  ) {}

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

    if (!ObjectId.isValid(id)) {
      return null;
    }
    const blogObjectId = new ObjectId(id);

    const posts = await this.PostModel.find(
      { blogId: blogObjectId },
      { _id: 0, __v: 0 },
    )
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip(skipSize)
      .limit(pageSize)
      .lean();

    if (!posts.length) {
      return null;
    }

    const postsCount = await this.PostModel.countDocuments({ blogId: id });

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
}
