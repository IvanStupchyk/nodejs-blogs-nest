import { HTTP_STATUSES, HttpStatusType } from '../../src/utils/utils';
import request from 'supertest';
import { CreateCommentModel } from '../../src/controllers/comments/models/create-comment.model';
import { ObjectId } from 'mongodb';
import { RouterPaths } from '../../src/constants/router.paths';

export const commentsTestManager = {
  async createComment(
    httpServer: string,
    data: CreateCommentModel,
    postId: any,
    token: string,
    expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
    userId: ObjectId = new ObjectId(),
    userLogin: string = '',
  ) {
    const response = await request(httpServer)
      .post(`${RouterPaths.posts}/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send(data)
      .expect(expectedStatusCode);

    let createdComment;

    if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {
      createdComment = response.body;

      expect(createdComment).toEqual({
        id: expect.any(String),
        content: data.content,
        commentatorInfo: {
          userId,
          userLogin,
        },
        likesInfo: {
          dislikesCount: 0,
          likesCount: 0,
          myStatus: 'None',
        },
        createdAt: expect.any(String),
      });
    }

    return { response, createdComment };
  },
};
