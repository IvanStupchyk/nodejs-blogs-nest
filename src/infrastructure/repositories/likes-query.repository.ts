import { Injectable } from '@nestjs/common';
import { PostLikesType } from '../../dtos/post-likes.dto';
import { ObjectId } from 'mongodb';
import { PostLikes, PostLikesDocument } from '../../schemas/post-likes.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class LikesQueryRepository {
  constructor(
    @InjectModel(PostLikes.name)
    private PostLikeModel: Model<PostLikesDocument>,
  ) {}
  async findPostLikeByUserIdAndPostId(
    userId: ObjectId,
    postId: ObjectId,
  ): Promise<PostLikesDocument | null> {
    return this.PostLikeModel.findOne({ userId, postId });
  }

  async fetchAllUserLikeByUserId(
    userId: ObjectId,
  ): Promise<Array<PostLikesType> | null> {
    return this.PostLikeModel.find({ userId }).lean();
  }
}
