import { Injectable } from '@nestjs/common';
import { CommentLikesInfoType, likeStatus } from '../../types/generalTypes';
import { CommentViewModel } from '../../controllers/comments/models/Comment.view.model';
import { CommentType } from '../../domains/comments/dto/comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentDocument, Comment } from '../../schemas/comment.schema';
import { ObjectId } from 'mongodb';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
  ) {}
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
