import request from 'supertest';
import { HTTP_STATUSES } from '../../src/utils/utils';
import { blogsTestManager } from '../utils/blogs-test-manager';
import { postsTestManager } from '../utils/posts-test-manager';
import { mockGetItems } from '../../src/constants/blanks';
import { RouterPaths } from '../../src/constants/router.paths';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { PostInputDto } from '../../src/application/dto/posts/post.input.dto';
import { v4 as uuidv4 } from 'uuid';
import {
  invalidPostData,
  userData1,
  userData2,
  validBlogData,
} from '../mockData/mock-data';
import { serverStarter } from '../utils/server-starter';
import { PostType } from '../../src/types/posts/posts.types';
import { BlogViewType } from '../../src/types/blogs/blogs.types';
import { userCreator } from '../utils/user-creator';
import { User } from '../../src/entities/users/User.entity';

describe('tests for /posts', () => {
  let validPostData: PostInputDto = {
    title: 'title',
    content: 'content',
    blogId: uuidv4(),
    shortDescription: 'shortDescription',
  };

  let app: INestApplication;
  let httpServer;
  let user2: User;
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
    accessTokenUser1 = resp.accessToken;
    refreshTokenUser1 = resp.refreshToken;

    const resp2 = await userCreator(httpServer, userData2);
    user2 = resp2.user;
    accessTokenUser2 = resp2.accessToken;
    refreshTokenUser2 = resp2.refreshToken;
  });

  afterAll(async () => {
    await request(httpServer).delete(`${RouterPaths.testing}/all-data`);
    await app.close();
  });

  it('should return 200 and an empty posts array', async () => {
    await getRequest()
      .get(RouterPaths.posts)
      .expect(HTTP_STATUSES.OK_200, mockGetItems);
  });

  it('should return 404 for not existing post', async () => {
    await getRequest()
      .get(RouterPaths.posts + '/3423')
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  let newBlog: BlogViewType;
  let blogUser2: BlogViewType;
  it("shouldn't create a post if the user is not logged in", async () => {
    await postsTestManager.createPostForSpecifiedBlog(
      httpServer,
      invalidPostData,
      'sdf',
      'we',
      'weff',
      HTTP_STATUSES.UNAUTHORIZED_401,
    );

    const { createdBlog } = await blogsTestManager.createBlog(
      httpServer,
      validBlogData,
      accessTokenUser1,
      refreshTokenUser1,
    );

    await getRequest()
      .get(`${RouterPaths.blogs}/${createdBlog.id}`)
      .expect(createdBlog);

    newBlog = createdBlog;

    const secondBlog = await blogsTestManager.createBlog(
      httpServer,
      {
        name: 'second user',
        description: 'aaaaa aaaaa',
        websiteUrl: 'https://www.aaaaa.com',
      },
      accessTokenUser2,
      refreshTokenUser2,
    );

    await getRequest()
      .get(`${RouterPaths.blogs}/${secondBlog.createdBlog.id}`)
      .expect(secondBlog.createdBlog);

    blogUser2 = secondBlog.createdBlog;
  });

  it("shouldn't create a post if the user sends invalid data", async () => {
    const { response } = await postsTestManager.createPostForSpecifiedBlog(
      httpServer,
      invalidPostData,
      '1d5ab9c1-b16e-4640-80af-67822894e4e4',
      accessTokenUser1,
      refreshTokenUser1,
      HTTP_STATUSES.BAD_REQUEST_400,
    );

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'title',
          message: 'title should not be an empty string',
        },
        {
          field: 'shortDescription',
          message: 'shortDescription should not be an empty string',
        },
        {
          field: 'content',
          message: 'content should not be an empty string',
        },
      ],
    });

    await getRequest()
      .get(RouterPaths.posts)
      .expect(HTTP_STATUSES.OK_200, mockGetItems);
  });

  it("shouldn't create a post if the blog belongs to other user", async () => {
    validPostData = {
      ...validPostData,
      blogId: newBlog.id,
    };

    await postsTestManager.createPostForSpecifiedBlog(
      httpServer,
      validPostData,
      newBlog.id,
      accessTokenUser2,
      refreshTokenUser2,
      HTTP_STATUSES.FORBIDDEN_403,
    );
  });

  let newPost: PostType;
  const newPosts: Array<PostType> = [];

  it('should create a post if the user sent valid data with existing blog id', async () => {
    validPostData = {
      ...validPostData,
      blogId: newBlog.id,
    };
    const { createdPost } = await postsTestManager.createPostForSpecifiedBlog(
      httpServer,
      validPostData,
      newBlog.id,
      accessTokenUser1,
      refreshTokenUser1,
      HTTP_STATUSES.CREATED_201,
    );

    newPost = createdPost;
    newPosts.push(newPost);

    await getRequest()
      .get(RouterPaths.posts)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [createdPost],
      });
  });

  it('should return correctly filtered and sorted posts', async () => {
    const pageNumber = 2;
    const pageSize = 2;

    const secondPost = await postsTestManager.createPostForSpecifiedBlog(
      httpServer,
      {
        ...validPostData,
        title: 'second',
      },
      newBlog.id,
      accessTokenUser1,
      refreshTokenUser1,
    );

    const thirdPost = await postsTestManager.createPostForSpecifiedBlog(
      httpServer,
      {
        ...validPostData,
        title: 'third',
      },
      newBlog.id,
      accessTokenUser1,
      refreshTokenUser1,
    );

    const fourthPost = await postsTestManager.createPostForSpecifiedBlog(
      httpServer,
      {
        ...validPostData,
        title: 'fourth',
        blogId: blogUser2.id,
      },
      blogUser2.id,
      accessTokenUser2,
      refreshTokenUser2,
    );

    newPosts.unshift(secondPost.createdPost);
    newPosts.unshift(thirdPost.createdPost);
    newPosts.unshift(fourthPost.createdPost);

    const sortedPosts = [...newPosts]
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(
        (pageNumber - 1) * pageSize,
        (pageNumber - 1) * pageSize + pageSize,
      );

    await getRequest().get(RouterPaths.posts).expect(HTTP_STATUSES.OK_200, {
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 4,
      items: newPosts,
    });

    await getRequest()
      .get(
        `${RouterPaths.posts}?sortBy=title&sortDirection=asc&pageSize=${pageSize}&pageNumber=${pageNumber}`,
      )
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 2,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: newPosts.length,
        items: sortedPosts,
      });
  });

  it('should ban a user and block its posts', async () => {
    const correctBody = {
      isBanned: true,
      banReason: 'because because because because because',
    };

    await request(httpServer)
      .put(`${RouterPaths.users}/${user2.id}/ban`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(correctBody)
      .expect(HttpStatus.NO_CONTENT);

    await getRequest()
      .get(RouterPaths.posts)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: newPosts.slice(1),
      });

    await request(httpServer)
      .put(`${RouterPaths.users}/${user2.id}/ban`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        isBanned: false,
        banReason: 'hasdas asdasda  asdasdas asasdasd asdasd',
      })
      .expect(HttpStatus.NO_CONTENT);
  });

  it("shouldn't update post if the post doesn't exist", async () => {
    await getRequest()
      .put(`${RouterPaths.blogger}/${newPost.blogId}/posts/123`)
      .set('Cookie', `refreshToken=${refreshTokenUser1}`)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .send(validPostData)
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it("shouldn't update post if the post belongs to other user", async () => {
    await getRequest()
      .put(`${RouterPaths.blogger}/blogs/${newPost.blogId}/posts/${newPost.id}`)
      .set('Cookie', `refreshToken=${refreshTokenUser2}`)
      .set({
        Authorization: `Bearer ${accessTokenUser2}`,
      })
      .send(validPostData)
      .expect(HTTP_STATUSES.FORBIDDEN_403);
  });

  it('should update a post with valid data', async () => {
    const updatedValidData = {
      ...validPostData,
      title: 'updated title',
    };
    await getRequest()
      .put(`${RouterPaths.blogger}/blogs/${newPost.blogId}/posts/${newPost.id}`)
      .set('Cookie', `refreshToken=${refreshTokenUser1}`)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .send(updatedValidData)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await getRequest()
      .get(`${RouterPaths.posts}/${newPost.id}`)
      .expect({
        ...newPost,
        title: updatedValidData.title,
      });
  });

  it("shouldn't delete a post if it doesn't exist", async () => {
    await getRequest()
      .delete(`${RouterPaths.blogger}/${newPost.blogId}/posts/321`)
      .set('Cookie', `refreshToken=${refreshTokenUser2}`)
      .set({
        Authorization: `Bearer ${accessTokenUser2}`,
      })
      .send(validPostData)
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it("shouldn't delete post if the post belongs to other user", async () => {
    await getRequest()
      .delete(
        `${RouterPaths.blogger}/blogs/${newPost.blogId}/posts/${newPost.id}`,
      )
      .set('Cookie', `refreshToken=${refreshTokenUser2}`)
      .set({
        Authorization: `Bearer ${accessTokenUser2}`,
      })
      .send(validPostData)
      .expect(HTTP_STATUSES.FORBIDDEN_403);
  });

  it('should delete a post with exiting id', async () => {
    await getRequest()
      .delete(
        `${RouterPaths.blogger}/blogs/${newPost.blogId}/posts/${newPost.id}`,
      )
      .set('Cookie', `refreshToken=${refreshTokenUser1}`)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    const filteredPosts = newPosts.filter((b) => b.id !== newPost.id);

    await getRequest().get(RouterPaths.posts).expect(HTTP_STATUSES.OK_200, {
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: filteredPosts.length,
      items: filteredPosts,
    });

    await getRequest()
      .get(RouterPaths.blogs)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [blogUser2, newBlog],
      });
  });
});
