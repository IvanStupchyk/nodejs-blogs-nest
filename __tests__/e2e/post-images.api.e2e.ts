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
import * as path from 'path';
import any = jasmine.any;

describe('tests for post images', () => {
  let validPostData: PostInputDto = {
    title: 'title',
    content: 'content',
    blogId: uuidv4(),
    shortDescription: 'shortDescription',
  };

  let app: INestApplication;
  let httpServer;
  let user1: User;
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

  let newBlog: BlogViewType;
  let blogUser2: BlogViewType;
  it('should create a two blogs for future tests', async () => {
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

  let newPost: PostType;
  const newPosts: Array<PostType> = [];
  it('should create four posts', async () => {
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
  });

  it('should not upload image if image does not exist or has incorrect format', async () => {
    const filePath = path.join(
      __dirname,
      'img',
      'post',
      'main',
      'main_incorrect_width.jpg',
    );

    const filePath2 = path.join(
      __dirname,
      'img',
      'post',
      'main',
      'main_incorrect_format.txt',
    );

    await request(httpServer)
      .post(
        `${RouterPaths.blogger}/blogs/${newBlog.id}/posts/${newPost.id}/images/main`,
      )
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [{ message: 'File is required', field: 'image' }],
      });

    await request(httpServer)
      .post(
        `${RouterPaths.blogger}/blogs/${newBlog.id}/posts/${newPost.id}/images/main`,
      )
      .attach('file', filePath)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            message: 'Image width, height, max size or format is incorrect',
            field: 'image',
          },
        ],
      });

    await request(httpServer)
      .post(
        `${RouterPaths.blogger}/blogs/${newBlog.id}/posts/${newPost.id}/images/main`,
      )
      .attach('file', filePath2)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            message: 'Image width, height, max size or format is incorrect',
            field: 'image',
          },
        ],
      });
  });

  it('should not upload image if post or blog do not exist or user tries to add image to not own post', async () => {
    const filePath = path.join(
      __dirname,
      'img',
      'post',
      'main',
      'main_940x432_79kb.jpeg',
    );

    await request(httpServer)
      .post(
        `${RouterPaths.blogger}/blogs/${newBlog.id}/posts/${newPost.id}/images/main`,
      )
      .attach('file', filePath)
      .set({
        Authorization: `Bearer ${accessTokenUser2}`,
      })
      .expect(HttpStatus.FORBIDDEN);

    await request(httpServer)
      .post(
        `${RouterPaths.blogger}/blogs/${newBlog.id}/posts/8d927580-23c2-4c7b-9f56-ea22b901bd45/images/main`,
      )
      .attach('file', filePath)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .expect(HttpStatus.NOT_FOUND);

    await request(httpServer)
      .post(
        `${RouterPaths.blogger}/blogs/8d927580-23c2-4c7b-9f56-ea22b901bd45/posts/${newPost.id}/images/main`,
      )
      .attach('file', filePath)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should upload image for post', async () => {
    const filePath = path.join(
      __dirname,
      'img',
      'post',
      'main',
      'main_940x432_79kb.jpeg',
    );

    const resp = await request(httpServer)
      .post(
        `${RouterPaths.blogger}/blogs/${newBlog.id}/posts/${newPost.id}/images/main`,
      )
      .attach('file', filePath)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .expect(HttpStatus.CREATED);

    expect(resp.body).toEqual({
      main: [
        {
          url: expect.any(String),
          width: 940,
          height: 432,
          fileSize: expect.any(Number),
        },
        {
          url: expect.any(String),
          width: 300,
          height: 180,
          fileSize: expect.any(Number),
        },
        {
          url: expect.any(String),
          width: 149,
          height: 96,
          fileSize: expect.any(Number),
        },
      ],
    });
  });

  it('should return correct mapped posts', async () => {
    const resp = await getRequest()
      .get(RouterPaths.posts)
      .expect(HTTP_STATUSES.OK_200);

    expect(resp.body.items).toEqual([
      ...newPosts.slice(0, -1),
      {
        ...newPost,
        images: {
          main: [
            {
              url: expect.any(String),
              width: 940,
              height: 432,
              fileSize: expect.any(Number),
            },
            {
              url: expect.any(String),
              width: 300,
              height: 180,
              fileSize: expect.any(Number),
            },
            {
              url: expect.any(String),
              width: 149,
              height: 96,
              fileSize: expect.any(Number),
            },
          ],
        },
      },
    ]);

    const resp2 = await getRequest()
      .get(`${RouterPaths.posts}/${newPost.id}`)
      .expect(HTTP_STATUSES.OK_200);

    expect(resp2.body).toEqual({
      ...newPost,
      images: {
        main: [
          {
            url: expect.any(String),
            width: 940,
            height: 432,
            fileSize: expect.any(Number),
          },
          {
            url: expect.any(String),
            width: 300,
            height: 180,
            fileSize: expect.any(Number),
          },
          {
            url: expect.any(String),
            width: 149,
            height: 96,
            fileSize: expect.any(Number),
          },
        ],
      },
    });
  });
});
