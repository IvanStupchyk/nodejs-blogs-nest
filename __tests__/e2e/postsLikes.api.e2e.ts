import request from 'supertest';
import { HTTP_STATUSES } from '../../src/utils/utils';
import { blogsTestManager } from '../utils/blogs-test-manager';
import { postsTestManager } from '../utils/posts-test-manager';
import { likeStatus } from '../../src/types/general.types';
import { INestApplication } from '@nestjs/common';
import { PostInputDto } from '../../src/application/dto/posts/post.input.dto';
import { RouterPaths } from '../../src/constants/router.paths';
import { errorsConstants } from '../../src/constants/errors.contants';
import { v4 as uuidv4 } from 'uuid';
import { PostViewType } from '../../src/types/posts/posts.types';
import { userData1, userData2, validBlogData } from '../mockData/mock-data';
import { serverStarter } from '../utils/server-starter';
import { BlogViewType } from '../../src/types/blogs/blogs.types';
import { userCreator } from '../utils/user-creator';

describe('tests for /posts with likes logic', () => {
  let validPostData: PostInputDto = {
    title: 'title',
    content: 'content',
    blogId: uuidv4(),
    shortDescription: 'shortDescription',
  };

  let app: INestApplication;
  let httpServer;
  let user1;
  let accessTokenUser1: string;
  let refreshTokenUser1: string;
  let user2;
  let accessTokenUser2: string;

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
  });

  afterAll(async () => {
    await request(httpServer).delete(`${RouterPaths.testing}/all-data`);
    await app.close();
  });

  let newBlog: BlogViewType;
  let post1: PostViewType;
  let post2: PostViewType;
  let post3: PostViewType;
  let post4: PostViewType;
  const newPosts: Array<PostViewType> = [];

  it('should return two created users', async () => {
    await getRequest()
      .get(RouterPaths.users)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [user2, user1],
      });
  });

  it('should create posts for future tests', async () => {
    const { createdBlog } = await blogsTestManager.createBlog(
      httpServer,
      validBlogData,
      accessTokenUser1,
      refreshTokenUser1,
    );

    await getRequest()
      .get(`${RouterPaths.blogs}/${createdBlog.id}`)
      .expect(createdBlog);

    validPostData = {
      ...validPostData,
      blogId: createdBlog.id,
    };

    const { createdPost } = await postsTestManager.createPostForSpecifiedBlog(
      httpServer,
      validPostData,
      createdBlog.id,
      accessTokenUser1,
      refreshTokenUser1,
      HTTP_STATUSES.CREATED_201,
    );
    const createdPost2 = await postsTestManager.createPostForSpecifiedBlog(
      httpServer,
      {
        title: 'a',
        content: 'content',
        blogId: createdBlog.id,
        shortDescription: 'shortDescription',
      },
      createdBlog.id,
      accessTokenUser1,
      refreshTokenUser1,
      HTTP_STATUSES.CREATED_201,
    );
    const createdPost3 = await postsTestManager.createPostForSpecifiedBlog(
      httpServer,
      {
        title: 'b',
        content: 'content',
        blogId: createdBlog.id,
        shortDescription: 'shortDescription',
      },
      createdBlog.id,
      accessTokenUser1,
      refreshTokenUser1,
      HTTP_STATUSES.CREATED_201,
    );
    const createdPost4 = await postsTestManager.createPostForSpecifiedBlog(
      httpServer,
      {
        title: 'c',
        content: 'content',
        blogId: createdBlog.id,
        shortDescription: 'shortDescription',
      },
      createdBlog.id,
      accessTokenUser1,
      refreshTokenUser1,
      HTTP_STATUSES.CREATED_201,
    );

    post1 = createdPost;
    post2 = createdPost2.createdPost;
    post3 = createdPost3.createdPost;
    post4 = createdPost4.createdPost;

    newBlog = createdBlog;
    newPosts.push(post4);
    newPosts.push(post3);
    newPosts.push(post2);
    newPosts.push(post1);

    await getRequest()
      .get(RouterPaths.posts)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: newPosts.length,
        items: [...newPosts],
      });
  });

  it('should not like post with incorrect input data', async () => {
    const updateLike = {
      likeStatus: 'ssss',
    };

    await getRequest()
      .put(`${RouterPaths.posts}/${post1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.BAD_REQUEST_400, {
        errorsMessages: [
          { field: 'likeStatus', message: errorsConstants.likeStatus },
        ],
      });
  });

  it('should like post with correct input data', async () => {
    const updateLike = {
      likeStatus: likeStatus.Like,
    };

    await getRequest()
      .put(`${RouterPaths.posts}/${post1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await getRequest()
      .put(`${RouterPaths.posts}/${post1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    post1.extendedLikesInfo.likesCount = 1;
    post1.extendedLikesInfo.myStatus = likeStatus.Like;

    const res = await getRequest()
      .get(`${RouterPaths.posts}/${post1.id}`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(HTTP_STATUSES.OK_200);

    expect(res.body).toEqual({
      ...post1,
      extendedLikesInfo: {
        ...post1.extendedLikesInfo,
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: user1.id,
            login: user1.login,
          },
        ],
      },
    });
  });

  it('should dislike post with correct input data', async () => {
    const updateLike = {
      likeStatus: likeStatus.Dislike,
    };

    await getRequest()
      .put(`${RouterPaths.posts}/${post1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await getRequest()
      .put(`${RouterPaths.posts}/${post1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    post1.extendedLikesInfo.dislikesCount = 1;
    post1.extendedLikesInfo.likesCount = 0;
    post1.extendedLikesInfo.myStatus = likeStatus.Dislike;

    const res = await getRequest()
      .get(`${RouterPaths.posts}/${post1.id}`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(HTTP_STATUSES.OK_200);

    expect(res.body).toEqual({
      ...post1,
      extendedLikesInfo: {
        ...post1.extendedLikesInfo,
        newestLikes: [],
      },
    });
  });

  it('should like post by user2 then set none value then like by user1 and user2', async () => {
    const updateLike = {
      likeStatus: likeStatus.Like,
    };

    await getRequest()
      .put(`${RouterPaths.posts}/${post1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    post1.extendedLikesInfo.likesCount = ++post1.extendedLikesInfo.likesCount;
    post1.extendedLikesInfo.myStatus = likeStatus.Like;

    const res1 = await getRequest()
      .get(`${RouterPaths.posts}/${post1.id}`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .expect(HTTP_STATUSES.OK_200);

    expect(res1.body).toEqual({
      ...post1,
      extendedLikesInfo: {
        ...post1.extendedLikesInfo,
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: user2.id,
            login: user2.login,
          },
        ],
      },
    });

    await getRequest()
      .put(`${RouterPaths.posts}/${post1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .send({
        likeStatus: likeStatus.None,
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    post1.extendedLikesInfo.likesCount = --post1.extendedLikesInfo.likesCount;
    post1.extendedLikesInfo.myStatus = likeStatus.None;

    const res2 = await getRequest()
      .get(`${RouterPaths.posts}/${post1.id}`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .expect(HTTP_STATUSES.OK_200);

    expect(res2.body).toEqual({
      ...post1,
      extendedLikesInfo: {
        ...post1.extendedLikesInfo,
        newestLikes: [],
      },
    });

    await getRequest()
      .put(`${RouterPaths.posts}/${post1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await getRequest()
      .put(`${RouterPaths.posts}/${post1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    post1.extendedLikesInfo.likesCount = 2;
    post1.extendedLikesInfo.dislikesCount = 0;
    post1.extendedLikesInfo.myStatus = likeStatus.Like;

    const res3 = await getRequest()
      .get(`${RouterPaths.posts}/${post1.id}`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .expect(HTTP_STATUSES.OK_200);

    expect(res3.body).toEqual({
      ...post1,
      extendedLikesInfo: {
        ...post1.extendedLikesInfo,
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: user2.id,
            login: user2.login,
          },
          {
            addedAt: expect.any(String),
            userId: user1.id,
            login: user1.login,
          },
        ],
      },
    });
  });

  it('should return all posts', async () => {
    const res = await getRequest()
      .get(`${RouterPaths.posts}`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .expect(HTTP_STATUSES.OK_200);

    expect(res.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 4,
      items: [
        post4,
        post3,
        post2,
        {
          ...post1,
          extendedLikesInfo: {
            ...post1.extendedLikesInfo,
            newestLikes: [
              {
                addedAt: expect.any(String),
                userId: user2.id,
                login: user2.login,
              },
              {
                addedAt: expect.any(String),
                userId: user1.id,
                login: user1.login,
              },
            ],
          },
        },
      ],
    });

    const res2 = await getRequest()
      .get(`${RouterPaths.posts}`)
      .expect(HTTP_STATUSES.OK_200);

    expect(res2.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 4,
      items: [
        post4,
        post3,
        post2,
        {
          ...post1,
          extendedLikesInfo: {
            ...post1.extendedLikesInfo,
            myStatus: likeStatus.None,
            newestLikes: [
              {
                addedAt: expect.any(String),
                userId: user2.id,
                login: user2.login,
              },
              {
                addedAt: expect.any(String),
                userId: user1.id,
                login: user1.login,
              },
            ],
          },
        },
      ],
    });
  });

  it('should return all posts for specified blog', async () => {
    const res = await getRequest()
      .get(`${RouterPaths.blogger}/blogs/${newBlog.id}/posts`)
      .set('Cookie', `refreshToken=${refreshTokenUser1}`)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .expect(HTTP_STATUSES.OK_200);

    expect(res.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 4,
      items: [
        post4,
        post3,
        post2,
        {
          ...post1,
          extendedLikesInfo: {
            ...post1.extendedLikesInfo,
            myStatus: 'Like',
            newestLikes: [
              {
                addedAt: expect.any(String),
                userId: user2.id,
                login: user2.login,
              },
              {
                addedAt: expect.any(String),
                userId: user1.id,
                login: user1.login,
              },
            ],
          },
        },
      ],
    });
  });
});
