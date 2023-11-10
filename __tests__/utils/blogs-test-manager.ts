import request from 'supertest';
import { HTTP_STATUSES, HttpStatusType } from '../../src/utils/utils';
import { RouterPaths } from '../../src/constants/router.paths';
import { NewBlogDto } from '../../src/controllers/blogs/models/blog.dto';

export const blogsTestManager = {
  async createBlog(
    httpServer: string,
    data: NewBlogDto,
    expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
    password = 'qwerty',
  ) {
    const response = await request(httpServer)
      .post(RouterPaths.blogs)
      .auth('admin', password, { type: 'basic' })
      .send(data)
      .expect(expectedStatusCode);

    let createdBlog;

    if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {
      createdBlog = response.body;

      expect(createdBlog).toEqual({
        id: expect.any(String),
        name: data.name,
        description: data.description,
        websiteUrl: data.websiteUrl,
        createdAt: expect.any(String),
        isMembership: false,
      });
    }

    return { response, createdBlog };
  },
};
