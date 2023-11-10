import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { createDefaultSortedParams, getPagesCount } from '../../utils/utils';
import { UsersQueryRepository } from './users-query.repository';
import {
  CommentsType,
  likeStatus,
  UserCommentLikesType,
} from '../../types/general.types';
import { mockCommentModel } from '../../constants/blanks';
import { CommentViewModel } from '../../controllers/comments/models/comment-view.model';
import { GetSortedCommentsModel } from '../../controllers/comments/models/get-sorted-comments.model';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../../schemas/comment.schema';
import { Model } from 'mongoose';
import { CommentType } from '../../domains/comments/dto/comment.dto';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async findCommentById(
    id: ObjectId,
    likedStatus: likeStatus = likeStatus.None,
  ): Promise<CommentViewModel | null> {
    const foundComment = await this.CommentModel.findOne(
      { id },
      { projection: { _id: 0 } },
    ).exec();

    return foundComment
      ? {
          id: foundComment.id,
          content: foundComment.content,
          commentatorInfo: {
            userId: foundComment.commentatorInfo.userId,
            userLogin: foundComment.commentatorInfo.userLogin,
          },
          likesInfo: {
            likesCount: foundComment.likesInfo.likesCount,
            dislikesCount: foundComment.likesInfo.dislikesCount,
            myStatus: likedStatus,
          },
          createdAt: foundComment.createdAt,
        }
      : null;
  }

  async getSortedComments(
    params: GetSortedCommentsModel,
    postId: ObjectId,
    userId: ObjectId | undefined,
  ): Promise<CommentsType> {
    const { pageNumber, pageSize, skipSize, sortBy, sortDirection } =
      createDefaultSortedParams({
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        model: mockCommentModel,
      });

    const comments: Array<CommentType> = await this.CommentModel.find(
      { postId },
      { _id: 0, __v: 0 },
    )
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip(skipSize)
      .limit(pageSize)
      .lean();

    const commentsCount = await this.CommentModel.countDocuments({ postId });

    const pagesCount = getPagesCount(commentsCount, pageSize);
    let usersCommentsLikes: any;
    if (userId) {
      usersCommentsLikes =
        await this.usersQueryRepository.findUserCommentLikesById(userId);
    }

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: commentsCount,
      items: comments.map((c) => {
        return {
          id: c.id,
          content: c.content,
          commentatorInfo: {
            userId: c.commentatorInfo.userId,
            userLogin: c.commentatorInfo.userLogin,
          },
          likesInfo: {
            likesCount: c.likesInfo.likesCount,
            dislikesCount: c.likesInfo.dislikesCount,
            myStatus:
              usersCommentsLikes?.find((uc: UserCommentLikesType) =>
                new ObjectId(uc.commentId).equals(c.id),
              )?.myStatus ?? likeStatus.None,
          },
          createdAt: c.createdAt,
        };
      }),
    };
  }
}
