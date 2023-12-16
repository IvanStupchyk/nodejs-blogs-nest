import { HTTP_STATUSES, HttpStatusType } from '../../src/utils/utils';
import request from 'supertest';
import { likeStatus } from '../../src/types/general.types';
import { RouterPaths } from '../../src/constants/router.paths';
import { PostInputDto } from '../../src/application/dto/posts/post.input.dto';

export const postsTestManager = {
  async createPostForSpecifiedBlog(
    httpServer: string,
    data: PostInputDto,
    blogId: any,
    accessToken = '123',
    refreshToken = '123',
    expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
  ) {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await request(httpServer)
      .post(`${RouterPaths.blogger}/${blogId}/posts`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .set(headers)
      .send(data)
      .expect(expectedStatusCode);

    let createdPost;

    if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {
      createdPost = response.body;

      expect(createdPost).toEqual({
        id: expect.any(String),
        title: data.title,
        content: data.content,
        shortDescription: data.shortDescription,
        blogId: data.blogId,
        createdAt: expect.any(String),
        blogName: createdPost.blogName,
        extendedLikesInfo: {
          dislikesCount: 0,
          likesCount: 0,
          myStatus: likeStatus.None,
          newestLikes: [],
        },
      });
    }

    return { response, createdPost };
  },
};
