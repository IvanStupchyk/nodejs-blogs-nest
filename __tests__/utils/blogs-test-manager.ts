import request from 'supertest';
import { HTTP_STATUSES, HttpStatusType } from '../../src/utils/utils';
import { RouterPaths } from '../../src/constants/router.paths';
import { BlogInputDto } from '../../src/application/dto/blogs/blog.input.dto';

export const blogsTestManager = {
  async createBlog(
    httpServer: string,
    data: BlogInputDto,
    accessToken = '123',
    refreshToken = '123',
    expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
  ) {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await request(httpServer)
      .post(`${RouterPaths.blogger}/blogs`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .set(headers)
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
        images: {
          wallpaper: null,
          main: null,
        },
      });
    }

    return { response, createdBlog };
  },
};
