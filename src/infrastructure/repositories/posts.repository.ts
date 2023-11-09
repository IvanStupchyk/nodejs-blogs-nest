import { Injectable } from '@nestjs/common';
import { Post, PostDocument } from '../../schemas/post.schema';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: Model<PostDocument>) {}
  async save(model: PostDocument) {
    return await model.save();
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
