import { HTTP_STATUSES, HttpStatusType } from '../../src/utils/utils';
import request from 'supertest';
import { likeStatus } from '../../src/types/general.types';
import { RouterPaths } from '../../src/constants/router.paths';
import { NewPostDto } from '../../src/controllers/posts/models/new-post.dto';

export const postsTestManager = {
  async createPost(
    httpServer: string,
    data: any,
    expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
    password = 'qwerty',
  ) {
    const response = await request(httpServer)
      .post(RouterPaths.posts)
      .auth('admin', password, { type: 'basic' })
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

  async createPostForSpecifiedBlog(
    httpServer: string,
    data: NewPostDto,
    blogId: any,
    expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
    password = 'qwerty',
  ) {
    const response = await request(httpServer)
      .post(`${RouterPaths.blogs}/${blogId}/posts`)
      .auth('admin', password, { type: 'basic' })
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
