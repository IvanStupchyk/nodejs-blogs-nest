import request from 'supertest';
import { HTTP_STATUSES } from '../../src/utils/utils';
import { blogsTestManager } from '../utils/blogs-test-manager';
import { postsTestManager } from '../utils/posts-test-manager';
import { usersTestManager } from '../utils/users-test-manager';
import { likeStatus } from '../../src/types/general.types';
import { INestApplication } from '@nestjs/common';
import { PostInputDto } from '../../src/dto/posts/post.input.dto';
import { RouterPaths } from '../../src/constants/router.paths';
import { errorsConstants } from '../../src/constants/errors.contants';
import { v4 as uuidv4 } from 'uuid';
import { UserViewType } from '../../src/types/users.types';
import { PostViewType } from '../../src/types/posts.types';
import {
  userData1,
  userData2,
  userData3,
  validBlogData,
} from '../mockData/mock-data';
import { serverStarter } from '../utils/server-starter';
import { BlogViewType } from '../../src/types/blogs.types';

describe('tests for /posts with likes logic', () => {
  let validPostData: PostInputDto = {
    title: 'title',
    content: 'content',
    blogId: uuidv4(),
    shortDescription: 'shortDescription',
  };

  let app: INestApplication;
  let httpServer;

  const getRequest = () => {
    return request(httpServer);
  };

  beforeAll(async () => {
    const serverConfig = await serverStarter();
    httpServer = serverConfig.httpServer;
    app = serverConfig.app;

    await request(httpServer).delete(`${RouterPaths.testing}/all-data`);
  });

  afterAll(async () => {
    await request(httpServer).delete(`${RouterPaths.testing}/all-data`);
    await app.close();
  });

  let newBlog: BlogViewType;
  let user1: UserViewType;
  let user2: UserViewType;
  let user3: UserViewType;
  let post1: PostViewType;
  let post2: PostViewType;
  let post3: PostViewType;
  let post4: PostViewType;
  let accessTokenUser1: string;
  let accessTokenUser2: string;
  let accessTokenUser3: string;
  const newPosts: Array<PostViewType> = [];

  it('should create users with for future tests', async () => {
    const { createdUser } = await usersTestManager.createUser(
      httpServer,
      userData1,
    );
    const secondUserData = await usersTestManager.createUser(
      httpServer,
      userData2,
    );
    const thirdUserData = await usersTestManager.createUser(
      httpServer,
      userData3,
    );

    user1 = createdUser;
    user2 = secondUserData.createdUser;
    user3 = thirdUserData.createdUser;

    await getRequest()
      .get(RouterPaths.users)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: [
          thirdUserData.createdUser,
          secondUserData.createdUser,
          createdUser,
        ],
      });
  });

  it('should create posts for future tests', async () => {
    const { createdBlog } = await blogsTestManager.createBlog(
      httpServer,
      validBlogData,
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

  it('should log in users with correct credentials and return access token', async () => {
    const result = await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: userData1.login,
        password: userData1.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    const result2 = await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: userData2.login,
        password: userData2.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    const result3 = await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: userData3.login,
        password: userData3.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    expect(result.body.accessToken).toEqual(expect.any(String));

    accessTokenUser1 = result.body.accessToken;
    accessTokenUser2 = result2.body.accessToken;
    accessTokenUser3 = result3.body.accessToken;
  }, 10000);

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
      .get(`${RouterPaths.saBlogs}/${newBlog.id}/posts`)
      .auth('admin', 'qwerty', { type: 'basic' })
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
            myStatus: 'None',
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
      .get(`${RouterPaths.saBlogs}/${newBlog.id}/posts`)
      .auth('admin', 'qwerty', { type: 'basic' })
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
});
