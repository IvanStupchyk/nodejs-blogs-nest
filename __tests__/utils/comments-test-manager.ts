import { HTTP_STATUSES, HttpStatusType } from '../../src/utils/utils';
import request from 'supertest';
import { RouterPaths } from '../../src/constants/router.paths';
import { v4 as uuidv4 } from 'uuid';

export const commentsTestManager = {
  async createComment(
    httpServer: string,
    data: { content: string },
    postId: any,
    token: string,
    expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
    userId: string = uuidv4(),
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
