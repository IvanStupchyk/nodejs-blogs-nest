import { PostLikesDocument } from '../schemas/post.likes.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LikesRepository {
  async save(model: PostLikesDocument) {
    return await model.save();
  }
}
