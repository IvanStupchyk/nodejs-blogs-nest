import { Injectable } from '@nestjs/common';
import {
  CommentLikesInfoType,
  CommentsType,
  likeStatus,
  UserCommentLikesType,
} from '../../types/general.types';
import { CommentViewModel } from '../../controllers/comments/models/comment-view.model';
import { CommentType } from '../../domains/comments/dto/comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentDocument, Comment } from '../../schemas/comment.schema';
import { ObjectId } from 'mongodb';
import { GetSortedCommentsModel } from '../../controllers/comments/models/get-sorted-comments.model';
import { createDefaultSortedParams, getPagesCount } from '../../utils/utils';
import { mockCommentModel } from '../../constants/blanks';
import { UsersRepository } from './users.repository';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
    private usersRepository: UsersRepository,
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
        await this.usersRepository.findUserCommentLikesById(userId);
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

  async createComment(comment: CommentType): Promise<CommentViewModel> {
    const commentInstance = new this.CommentModel();

    commentInstance.id = comment.id;
    commentInstance.content = comment.content;
    commentInstance.postId = comment.postId;
    commentInstance.commentatorInfo = comment.commentatorInfo;
    commentInstance.likesInfo = comment.likesInfo;
    commentInstance.createdAt = comment.createdAt;

    await commentInstance.save();

    return {
      id: commentInstance.id,
      content: commentInstance.content,
      commentatorInfo: {
        userId: commentInstance.commentatorInfo.userId,
        userLogin: commentInstance.commentatorInfo.userLogin,
      },
      likesInfo: {
        likesCount: commentInstance.likesInfo.likesCount,
        dislikesCount: commentInstance.likesInfo.dislikesCount,
        myStatus: likeStatus.None,
      },
      createdAt: commentInstance.createdAt,
    };
  }

  async updateComment(content: string, id: ObjectId): Promise<boolean> {
    const result = await this.CommentModel.updateOne(
      { id },
      { $set: { content } },
    ).exec();

    return result.matchedCount === 1;
  }

  async changeLikesCount(
    id: string,
    likesInfo: CommentLikesInfoType,
  ): Promise<boolean> {
    const result = await this.CommentModel.updateOne(
      { id },
      { $set: { likesInfo } },
    ).exec();

    return result.matchedCount === 1;
  }

  async deleteComment(id: string): Promise<boolean> {
    const result = await this.CommentModel.deleteOne({ id }).exec();

    return result.deletedCount === 1;
  }
}
