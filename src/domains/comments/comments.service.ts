import { ObjectId } from 'mongodb';
import { CommentsRepository } from '../../infrastructure/repositories/comments.repository';
import { CommentViewModel } from '../../controllers/comments/models/comment-view.model';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentsService {
  constructor(protected readonly commentsRepository: CommentsRepository) {}

  async findCommentByIdWithoutLikeStatus(
    id: string,
  ): Promise<CommentViewModel | null> {
    if (!ObjectId.isValid(id)) return null;
    return await this.commentsRepository.findCommentById(new ObjectId(id));
  }
}
