import { PostLikes, PostLikesDocument } from '../../schemas/post-likes.schema';
import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { PostLikesType } from '../../dtos/post-likes.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class LikesRepository {
  constructor(
    @InjectModel(PostLikes.name)
    private PostLikeModel: Model<PostLikesDocument>,
  ) {}

  async save(model: PostLikesDocument) {
    return await model.save();
  }

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
