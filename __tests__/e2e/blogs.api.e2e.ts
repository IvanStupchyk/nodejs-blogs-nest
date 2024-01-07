import request from 'supertest';
import { HTTP_STATUSES } from '../../src/utils/utils';
import { blogsTestManager } from '../utils/blogs-test-manager';
import { mockGetItems } from '../../src/constants/blanks';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { RouterPaths } from '../../src/constants/router.paths';
import { postsTestManager } from '../utils/posts-test-manager';
import {
  invalidBlogData,
  userData1,
  userData2,
  validBlogData,
  validPostData,
} from '../mockData/mock-data';
import { serverStarter } from '../utils/server-starter';
import { PostType } from '../../src/types/posts/posts.types';
import { BlogViewType } from '../../src/types/blogs/blogs.types';
import { userCreator } from '../utils/user-creator';
import { SubscriptionStatus } from '../../src/constants/subscription-status.enum';

describe('tests for /blogs', () => {
  let app: INestApplication;
  let httpServer;
  let user1;
  let user2;
  let accessTokenUser1: string;
  let refreshTokenUser1: string;
  let accessTokenUser2: string;
  let refreshTokenUser2: string;

  const getRequest = () => {
    return request(httpServer);
  };

  beforeAll(async () => {
    const serverConfig = await serverStarter();
    httpServer = serverConfig.httpServer;
    app = serverConfig.app;

    await request(httpServer).delete(`${RouterPaths.testing}/all-data`);

    const resp = await userCreator(httpServer, userData1);
    user1 = resp.user;
    accessTokenUser1 = resp.accessToken;
    refreshTokenUser1 = resp.refreshToken;

    const resp2 = await userCreator(httpServer, userData2);
    user2 = resp2.user;
    accessTokenUser2 = resp2.accessToken;
    refreshTokenUser2 = resp2.refreshToken;
  });

  afterAll(async () => {
    // await request(httpServer).delete(`${RouterPaths.testing}/all-data`);
    await app.close();
  });

  const newBlogs: Array<BlogViewType> = [];

  it('should return 200 and an empty blogs array', async () => {
    await getRequest()
      .get(RouterPaths.blogs)
      .expect(HTTP_STATUSES.OK_200, mockGetItems);
  });

  it('should return 404 for not existing blog', async () => {
    await getRequest()
      .get(RouterPaths.blogs + '/3423')
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it("shouldn't create a blog if the user is not logged in", async () => {
    await blogsTestManager.createBlog(
      httpServer,
      invalidBlogData,
      '1111',
      '2222',
      HTTP_STATUSES.UNAUTHORIZED_401,
    );
  });

  it("shouldn't create a blog if the user sends invalid data", async () => {
    const { response } = await blogsTestManager.createBlog(
      httpServer,
      invalidBlogData,
      accessTokenUser1,
      refreshTokenUser1,
      HTTP_STATUSES.BAD_REQUEST_400,
    );

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'name',
          message: 'name should not be an empty string',
        },
        {
          field: 'description',
          message: 'description should not be an empty string',
        },
        {
          field: 'websiteUrl',
          message:
            'websiteUrl must match /^https:\\/\\/([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$/ regular expression',
        },
      ],
    });

    await getRequest()
      .get(RouterPaths.blogs)
      .expect(HTTP_STATUSES.OK_200, mockGetItems);
  });

  let newBlog: BlogViewType;
  let blog2: BlogViewType;
  let blog3: BlogViewType;
  let newPost: PostType;
  let secondPost: PostType;
  it('should create a blog if the user sends the valid data', async () => {
    const { createdBlog } = await blogsTestManager.createBlog(
      httpServer,
      validBlogData,
      accessTokenUser1,
      refreshTokenUser1,
    );

    newBlog = createdBlog;
    newBlogs.push(createdBlog);

    await getRequest()
      .get(RouterPaths.blogs)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [createdBlog],
      });

    delete newBlog.images;
    delete newBlog.subscribersCount;
    delete newBlog.currentUserSubscriptionStatus;
    await getRequest()
      .get(RouterPaths.saBlogs)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            ...createdBlog,
            blogOwnerInfo: {
              userId: user1.id,
              userLogin: user1.login,
            },
            banInfo: {
              isBanned: false,
              banDate: null,
            },
          },
        ],
      });
  });

  it('should not ban blog if body is incorrect or blog does not exist', async () => {
    await getRequest()
      .put(`${RouterPaths.saBlogs}/sddf/ban`)
      .expect(HttpStatus.UNAUTHORIZED);

    await getRequest()
      .put(`${RouterPaths.saBlogs}/073cae38-5e01-46de-8463-69cb8775097d/ban`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .set({
        isBanned: 'ad',
      })
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          { message: 'isBanned must be a boolean value', field: 'isBanned' },
        ],
      });

    await getRequest()
      .put(`${RouterPaths.saBlogs}/073cae38-5e01-46de-8463-69cb8775097d/ban`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        isBanned: true,
      })
      .expect(HttpStatus.NOT_FOUND);

    await getRequest()
      .get(RouterPaths.saBlogs)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            ...newBlog,
            blogOwnerInfo: {
              userId: user1.id,
              userLogin: user1.login,
            },
            banInfo: {
              isBanned: false,
              banDate: null,
            },
          },
        ],
      });
  });

  it('should ban, unban blog', async () => {
    await getRequest()
      .put(`${RouterPaths.saBlogs}/${newBlog.id}/ban`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        isBanned: true,
      })
      .expect(HttpStatus.NO_CONTENT);

    const resp = await getRequest()
      .get(RouterPaths.saBlogs)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.OK_200);

    expect(resp.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          ...newBlog,
          blogOwnerInfo: {
            userId: user1.id,
            userLogin: user1.login,
          },
          banInfo: {
            isBanned: true,
            banDate: expect.any(String),
          },
        },
      ],
    });

    await getRequest()
      .put(`${RouterPaths.saBlogs}/${newBlog.id}/ban`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        isBanned: false,
      })
      .expect(HttpStatus.NO_CONTENT);

    const resp2 = await getRequest()
      .get(RouterPaths.saBlogs)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.OK_200);

    expect(resp2.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          ...newBlog,
          blogOwnerInfo: {
            userId: user1.id,
            userLogin: user1.login,
          },
          banInfo: {
            isBanned: false,
            banDate: null,
          },
        },
      ],
    });
  });

  it('should return all posts for specified blog', async () => {
    const validPostData1 = {
      ...validPostData,
      blogId: newBlog.id,
    };
    const { createdPost } = await postsTestManager.createPostForSpecifiedBlog(
      httpServer,
      validPostData1,
      newBlog.id,
      accessTokenUser1,
      refreshTokenUser1,
      HTTP_STATUSES.CREATED_201,
    );

    newPost = createdPost;

    await getRequest()
      .get(RouterPaths.posts)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [createdPost],
      });

    await getRequest()
      .put(`${RouterPaths.saBlogs}/${newBlog.id}/ban`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        isBanned: true,
      })
      .expect(HttpStatus.NO_CONTENT);

    await getRequest().get(RouterPaths.posts).expect(HTTP_STATUSES.OK_200, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });

    await getRequest()
      .put(`${RouterPaths.saBlogs}/${newBlog.id}/ban`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        isBanned: false,
      })
      .expect(HttpStatus.NO_CONTENT);

    await getRequest()
      .get(RouterPaths.posts)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [createdPost],
      });

    await getRequest()
      .get(`${RouterPaths.blogger}/blogs/${newBlog.id}/posts`)
      .set('Cookie', `refreshToken=${refreshTokenUser1}`)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [createdPost],
      });
  });

  it('should return correctly filtered and sorted blogs', async () => {
    const pageNumber = 2;
    const pageSize = 2;

    const secondBlog = await blogsTestManager.createBlog(
      httpServer,
      {
        ...validBlogData,
        name: 'second',
        description: 'a',
      },
      accessTokenUser1,
      refreshTokenUser1,
    );

    const thirdBlog = await blogsTestManager.createBlog(
      httpServer,
      {
        ...validBlogData,
        name: 'third',
        description: 'b',
      },
      accessTokenUser1,
      refreshTokenUser1,
    );

    const fourthBlog = await blogsTestManager.createBlog(
      httpServer,
      {
        ...validBlogData,
        name: 'fourth',
        description: 'c',
      },
      accessTokenUser2,
      refreshTokenUser2,
    );

    blog2 = secondBlog.createdBlog;
    blog3 = thirdBlog.createdBlog;
    newBlogs.unshift(secondBlog.createdBlog);
    newBlogs.unshift(thirdBlog.createdBlog);
    newBlogs.unshift(fourthBlog.createdBlog);

    const sortedBlogs = [...newBlogs]
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(
        (pageNumber - 1) * pageSize,
        (pageNumber - 1) * pageSize + pageSize,
      );
    newBlog = {
      ...newBlog,
      images: {
        wallpaper: null,
        main: null,
      },
    };

    await getRequest()
      .get(`${RouterPaths.blogger}/blogs?searchNameTerm=second`)
      .set('Cookie', `refreshToken=${refreshTokenUser1}`)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [secondBlog.createdBlog],
      });

    await getRequest()
      .get(
        `${RouterPaths.blogs}?sortBy=name&sortDirection=asc&pageSize=${pageSize}&pageNumber=${pageNumber}`,
      )
      .set('Cookie', `refreshToken=${refreshTokenUser1}`)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 2,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: newBlogs.length,
        items: sortedBlogs,
      });
  });

  it('should create a new post for specific blog', async () => {
    const validPostData1 = {
      ...validPostData,
      blogId: newBlog.id,
    };
    const { createdPost } = await postsTestManager.createPostForSpecifiedBlog(
      httpServer,
      { ...validPostData1, title: 'second' },
      newBlog.id,
      accessTokenUser1,
      refreshTokenUser1,
      HTTP_STATUSES.CREATED_201,
    );

    secondPost = createdPost;

    await getRequest()
      .get(RouterPaths.posts)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [createdPost, newPost],
      });

    await getRequest()
      .get(`${RouterPaths.blogger}/blogs/${newBlog.id}/posts`)
      .set('Cookie', `refreshToken=${refreshTokenUser1}`)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [createdPost, newPost],
      });
  });

  it("shouldn't create a post if blog doesn't exist", async () => {
    await postsTestManager.createPostForSpecifiedBlog(
      httpServer,
      validPostData,
      '333',
      accessTokenUser1,
      refreshTokenUser1,
      HTTP_STATUSES.NOT_FOUND_404,
    );

    await getRequest()
      .get(RouterPaths.posts)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [secondPost, newPost],
      });
  });

  it("shouldn't update a blog if the blog doesn't exist", async () => {
    await getRequest()
      .put(`${RouterPaths.blogger}/blogs/22`)
      .set('Cookie', `refreshToken=${refreshTokenUser1}`)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .send(validBlogData)
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it("shouldn't update a blog that does not belong to current user", async () => {
    const updatedValidData = {
      ...validBlogData,
      name: 'updated name',
    };
    await getRequest()
      .put(`${RouterPaths.blogger}/blogs/${newBlog.id}`)
      .set('Cookie', `refreshToken=${refreshTokenUser2}`)
      .set({
        Authorization: `Bearer ${accessTokenUser2}`,
      })
      .send(updatedValidData)
      .expect(HTTP_STATUSES.FORBIDDEN_403);
  });

  it('should update a blog with valid data', async () => {
    const updatedValidData = {
      ...validBlogData,
      name: 'updated name',
    };
    await getRequest()
      .put(`${RouterPaths.blogger}/blogs/${newBlog.id}`)
      .set('Cookie', `refreshToken=${refreshTokenUser1}`)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .send(updatedValidData)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    const resp = await getRequest()
      .get(`${RouterPaths.blogs}/${newBlog.id}`)
      .expect({
        ...newBlog,
        name: updatedValidData.name,
        images: {
          wallpaper: null,
          main: [],
        },
        subscribersCount: 0,
        currentUserSubscriptionStatus: SubscriptionStatus.None,
      });
  });

  it('should not bind a user to the blog if blog or user do not exist or user has already bind to the blog', async () => {
    const resp = await getRequest()
      .put(`${RouterPaths.saBlogs}/3211/bind-with-user/123`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(resp.body).toEqual({
      errorsMessages: [
        {
          field: 'id',
          message: 'such blog should exist',
        },
        {
          field: 'userId',
          message: 'user does not exist',
        },
      ],
    });

    await getRequest()
      .put(`${RouterPaths.saBlogs}/${newBlog.id}/bind-with-user/${user1.id}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);
  });

  describe('ban user for specified blog', () => {
    it('should not ban a user for specified if body is incorrect, user does not exist or user not authorized', async () => {
      const body = {
        isBanned: '',
        banDate: false,
        banReason: [1, 2],
        blogId: 'asd',
      };

      await request(httpServer)
        .put(`${RouterPaths.blogger}/users/asfaf/ban`)
        .send(body)
        .expect(HttpStatus.UNAUTHORIZED);

      const rest = await request(httpServer)
        .put(`${RouterPaths.blogger}/users/asfaf/ban`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .send(body)
        .expect(HttpStatus.BAD_REQUEST);

      expect(rest.body).toEqual({
        errorsMessages: [
          {
            field: 'isBanned',
            message: 'isBanned must be a boolean value',
          },
          {
            field: 'banReason',
            message: 'banReason must be longer than or equal to 20 characters',
          },
          {
            field: 'blogId',
            message: 'such blog should exist',
          },
        ],
      });

      const correctBody = {
        isBanned: true,
        banDate: new Date(),
        banReason: 'because because because because because because',
        blogId: newBlog.id,
      };

      const resp2 = await request(httpServer)
        .put(
          `${RouterPaths.blogger}/users/1427c8cc-0bde-45c8-abba-cde6fe07474d/ban`,
        )
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .send(correctBody)
        .expect(HttpStatus.NOT_FOUND);
    });

    const secondBanReason =
      'second time because because because because because because';
    it('should ban, unban and ban a user for specified blog', async () => {
      const correctBody = {
        isBanned: true,
        banDate: new Date(),
        banReason: 'because because because because because because',
        blogId: newBlog.id,
      };

      await request(httpServer)
        .put(`${RouterPaths.blogger}/users/${user1.id}/ban`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .send(correctBody)
        .expect(HttpStatus.NO_CONTENT);

      await request(httpServer)
        .put(`${RouterPaths.blogger}/users/${user1.id}/ban`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .send({
          ...correctBody,
          isBanned: false,
        })
        .expect(HttpStatus.NO_CONTENT);

      await request(httpServer)
        .put(`${RouterPaths.blogger}/users/${user1.id}/ban`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .send({
          ...correctBody,
          isBanned: true,
          banReason: secondBanReason,
        })
        .expect(HttpStatus.NO_CONTENT);

      const resp = await request(httpServer)
        .get(`${RouterPaths.blogger}/users/blog/${newBlog.id}`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .expect(HttpStatus.OK);

      expect(resp.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: user1.id,
            login: user1.login,
            banInfo: {
              isBanned: true,
              banDate: expect.any(String),
              banReason: secondBanReason,
            },
          },
        ],
      });
    });

    it('should ban second user and get all banned users', async () => {
      const correctBody = {
        isBanned: true,
        banDate: new Date(),
        banReason: 'second ban ddfdfdfdfdfdfdfdfdfdfdf',
        blogId: newBlog.id,
      };

      await request(httpServer)
        .put(`${RouterPaths.blogger}/users/${user2.id}/ban`)
        .set('Authorization', `Bearer ${accessTokenUser2}`)
        .send(correctBody)
        .expect(HttpStatus.FORBIDDEN);

      await request(httpServer)
        .put(`${RouterPaths.blogger}/users/${user2.id}/ban`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .send(correctBody)
        .expect(HttpStatus.NO_CONTENT);

      await request(httpServer)
        .get(`${RouterPaths.blogger}/users/blog/${newBlog.id}`)
        .set('Authorization', `Bearer ${accessTokenUser2}`)
        .expect(HttpStatus.FORBIDDEN);

      await request(httpServer)
        .get(
          `${RouterPaths.blogger}/users/blog/800d41a3-eb8f-40d9-b6e5-eb2a57a98778`,
        )
        .set('Authorization', `Bearer ${accessTokenUser2}`)
        .expect(HttpStatus.NOT_FOUND);

      const resp = await request(httpServer)
        .get(`${RouterPaths.blogger}/users/blog/${newBlog.id}`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .expect(HttpStatus.OK);

      expect(resp.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [
          {
            id: user2.id,
            login: user2.login,
            banInfo: {
              isBanned: true,
              banDate: expect.any(String),
              banReason: correctBody.banReason,
            },
          },
          {
            id: user1.id,
            login: user1.login,
            banInfo: {
              isBanned: true,
              banDate: expect.any(String),
              banReason: secondBanReason,
            },
          },
        ],
      });

      const resp2 = await request(httpServer)
        .get(
          `${RouterPaths.blogger}/users/blog/${newBlog.id}?searchLoginTerm=iva`,
        )
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .expect(HttpStatus.OK);

      expect(resp2.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: user1.id,
            login: user1.login,
            banInfo: {
              isBanned: true,
              banDate: expect.any(String),
              banReason: secondBanReason,
            },
          },
        ],
      });

      const resp3 = await request(httpServer)
        .get(`${RouterPaths.blogger}/users/blog/${newBlog.id}?pageSize=1`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .expect(HttpStatus.OK);

      expect(resp3.body).toEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 1,
        totalCount: 2,
        items: [
          {
            id: user2.id,
            login: user2.login,
            banInfo: {
              isBanned: true,
              banDate: expect.any(String),
              banReason: correctBody.banReason,
            },
          },
        ],
      });
    });
  });

  it("shouldn't delete a blog if the blog doesn't exist", async () => {
    await getRequest()
      .delete(`${RouterPaths.blogger}/blogs/22`)
      .set('Cookie', `refreshToken=${refreshTokenUser1}`)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .send(validBlogData)
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it("shouldn't delete a blog that does not belong to current user", async () => {
    await getRequest()
      .delete(`${RouterPaths.blogger}/blogs/${newBlog.id}`)
      .set('Cookie', `refreshToken=${refreshTokenUser2}`)
      .set({
        Authorization: `Bearer ${accessTokenUser2}`,
      })
      .expect(HTTP_STATUSES.FORBIDDEN_403);
  });

  it('should delete a blog with exiting id', async () => {
    await getRequest()
      .delete(`${RouterPaths.blogger}/blogs/${newBlog.id}`)
      .set('Cookie', `refreshToken=${refreshTokenUser1}`)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await getRequest()
      .get(`${RouterPaths.blogs}/${newBlog.id}`)
      .set('Cookie', `refreshToken=${refreshTokenUser1}`)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .expect(HttpStatus.NOT_FOUND);

    const filteredBlogs = newBlogs.filter((b) => b.id !== newBlog.id);

    await getRequest()
      .get(RouterPaths.blogs)
      .set('Cookie', `refreshToken=${refreshTokenUser1}`)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: filteredBlogs.length,
        items: filteredBlogs,
      });
  });
});
