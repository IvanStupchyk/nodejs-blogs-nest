import { ObjectId } from 'mongodb';
import { likesCounter } from '../../utils/likes-counter';
import { CommentsRepository } from '../../infrastructure/repositories/comments.repository';
import { CommentType } from './dto/comment.dto';
import { CommentsType, likeStatus } from '../../types/general.types';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { CommentViewModel } from '../../controllers/comments/models/comment-view.model';
import { GetSortedCommentsModel } from '../../controllers/comments/models/get-sorted-comments.model';
import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '../../infrastructure/jwt.service';
import { errorMessageGenerator } from '../../utils/error-message-generator';
import { errorsConstants } from '../../constants/errors.contants';
import { PostsRepository } from '../../infrastructure/repositories/posts.repository';

@Injectable()
export class CommentsService {
  constructor(
    protected readonly usersRepository: UsersRepository,
    protected readonly commentsRepository: CommentsRepository,
    protected readonly postsRepository: PostsRepository,
    protected readonly jwtService: JwtService,
  ) {}

  async createComment(
    content: string,
    id: string,
    userId: string,
  ): Promise<CommentViewModel | number> {
    if (!ObjectId.isValid(id)) return HttpStatus.NOT_FOUND;
    if (!ObjectId.isValid(userId)) return HttpStatus.NOT_FOUND;
    const postObjectId = new ObjectId(id);
    const userObjectId = new ObjectId(userId);

    const foundPost = await this.postsRepository.findPostById(postObjectId);

    if (!foundPost) return HttpStatus.NOT_FOUND;

    const user = await this.usersRepository.findUserById(userObjectId);
    if (!user) return HttpStatus.NOT_FOUND;

    const newComment: CommentType = new CommentType(
      new ObjectId(),
      content,
      postObjectId,
      {
        userId: user.id,
        userLogin: user.login,
      },
      {
        likesCount: 0,
        dislikesCount: 0,
      },
      new Date().toISOString(),
    );

    return await this.commentsRepository.createComment(newComment);
  }

  async updateComment(
    content: string,
    id: string,
    currentUserId: ObjectId,
  ): Promise<number> {
    const foundComment = await this.findCommentByIdWithoutLikeStatus(id);

    if (
      foundComment &&
      !new ObjectId(foundComment.commentatorInfo.userId).equals(currentUserId)
    ) {
      return HttpStatus.FORBIDDEN;
    }

    if (!ObjectId.isValid(id)) return HttpStatus.NOT_FOUND;
    const isCommentUpdated = await this.commentsRepository.updateComment(
      content,
      new ObjectId(id),
    );

    if (isCommentUpdated) return HttpStatus.NO_CONTENT;

    return HttpStatus.NOT_FOUND;
  }

  async findCommentById(
    commentId: string,
    accessTokenHeader: string | undefined,
  ): Promise<CommentViewModel | null> {
    if (!ObjectId.isValid(commentId)) return null;
    const commentObjectId = new ObjectId(commentId);

    let userId;
    if (accessTokenHeader) {
      const accessToken = accessTokenHeader.split(' ')[1];
      userId = await this.jwtService.getUserIdByAccessToken(accessToken);
    }

    let finalCommentStatus = likeStatus.None;

    if (userId) {
      const userCommentsLikes =
        await this.usersRepository.findUserCommentLikesById(userId);

      if (Array.isArray(userCommentsLikes) && userCommentsLikes.length) {
        const initialCommentData = userCommentsLikes.find((c) =>
          new ObjectId(c.commentId).equals(commentObjectId),
        );

        if (initialCommentData) {
          finalCommentStatus = initialCommentData.myStatus;
        }
      }
    }

    return await this.commentsRepository.findCommentById(
      commentObjectId,
      finalCommentStatus,
    );
  }

  async changeLikesCount(
    id: string,
    myStatus: string,
    userId: ObjectId,
  ): Promise<boolean> {
    if (!likeStatus[myStatus]) {
      errorMessageGenerator([
        { field: 'likeStatus', message: errorsConstants.likeStatus },
      ]);
    }
    if (!ObjectId.isValid(id)) return false;
    const commentObjectId = new ObjectId(id);
    const foundComment =
      await this.commentsRepository.findCommentById(commentObjectId);
    if (!foundComment) return false;

    const userCommentsLikes =
      await this.usersRepository.findUserCommentLikesById(userId);
    let initialCommentData;

    if (Array.isArray(userCommentsLikes) && userCommentsLikes.length) {
      initialCommentData = userCommentsLikes.find((c) =>
        new ObjectId(c.commentId).equals(commentObjectId),
      );
    }

    if (initialCommentData?.myStatus === myStatus) return true;

    const { likesInfo, newStatus } = likesCounter(
      myStatus,
      likeStatus.None,
      initialCommentData?.myStatus,
      {
        likesCount: foundComment.likesInfo.likesCount,
        dislikesCount: foundComment.likesInfo.dislikesCount,
      },
    );

    const user = await this.usersRepository.fetchAllUserDataById(userId);
    if (!user) return false;

    if (initialCommentData?.myStatus) {
      user.updateExistingUserCommentLike(newStatus, commentObjectId);
    } else {
      user.setNewUserCommentLike(newStatus, commentObjectId);
    }

    await this.usersRepository.save(user);

    return await this.commentsRepository.changeLikesCount(id, likesInfo);
  }

  async getSortedComments(
    id: string,
    query: GetSortedCommentsModel,
    accessTokenHeader: string | undefined,
  ): Promise<CommentsType | boolean> {
    if (!ObjectId.isValid(id)) return false;
    const postObjectId = new ObjectId(id);

    const foundPost = await this.postsRepository.findPostById(postObjectId);
    if (!foundPost) return false;

    let userId;
    if (accessTokenHeader) {
      const accessToken = accessTokenHeader.split(' ')[1];
      userId = await this.jwtService.getUserIdByAccessToken(accessToken);
    }

    return await this.commentsRepository.getSortedComments(
      query,
      postObjectId,
      userId,
    );
  }

  async findCommentByIdWithoutLikeStatus(
    id: string,
  ): Promise<CommentViewModel | null> {
    if (!ObjectId.isValid(id)) return null;
    return await this.commentsRepository.findCommentById(new ObjectId(id));
  }

  async deleteComment(
    commentId: string,
    currentUserId: ObjectId,
  ): Promise<number> {
    if (!ObjectId.isValid(commentId)) return HttpStatus.NOT_FOUND;

    const foundComment = await this.findCommentByIdWithoutLikeStatus(commentId);
    if (!foundComment) return HttpStatus.NOT_FOUND;

    if (
      foundComment &&
      !new ObjectId(foundComment.commentatorInfo.userId).equals(currentUserId)
    ) {
      return HttpStatus.FORBIDDEN;
    }

    const idDeleted = await this.commentsRepository.deleteComment(commentId);

    if (idDeleted) {
      return HttpStatus.NO_CONTENT;
    } else {
      return HttpStatus.NOT_FOUND;
    }
  }
}
