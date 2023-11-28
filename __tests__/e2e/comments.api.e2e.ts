import request from 'supertest';
import { HTTP_STATUSES } from '../../src/utils/utils';
import { likeStatus } from '../../src/types/general.types';
import { usersTestManager } from '../utils/users-test-manager';
import { blogsTestManager } from '../utils/blogs-test-manager';
import { postsTestManager } from '../utils/posts-test-manager';
import { INestApplication } from '@nestjs/common';
import { BlogModel } from '../../src/models/blogs/Blog.model';
import { RouterPaths } from '../../src/constants/router.paths';
import { commentsTestManager } from '../utils/comments-test-manager';
import { LoginUserInputDto } from '../../src/dto/auth/login-user.input.dto';
import { CommentInputDto } from '../../src/dto/comments/comment.input.dto';
import { errorsConstants } from '../../src/constants/errors.contants';
import { UserViewType } from '../../src/types/users.types';
import { CommentViewType } from '../../src/types/comments.types';
import { userData1, userData2, userData3 } from '../mockData/mock-data';
import { serverStarter } from '../utils/server-starter';
import { PostType } from '../../src/types/posts.types';

const sleep = (seconds: number) =>
  new Promise((r) => setTimeout(r, seconds * 1000));

describe('tests for /comments and posts/:id/comments', () => {
  const invalidCommentData = {
    content: '',
  };

  const validCommentData = {
    content: 'new comment for existing comment',
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
    await app.close();
  });

  let newPost: PostType;
  let newBlog: BlogModel;
  let user1: UserViewType;
  let user2: UserViewType;
  let user3: UserViewType;
  let comment1: CommentViewType;
  let comment2: CommentViewType;
  let comment3: CommentViewType;
  const newComments: Array<CommentViewType> = [];
  let accessTokenUser1: string;
  let accessTokenUser2: string;
  let accessTokenUser3: string;

  it('should create a user with correct credentials for future tests', async () => {
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

  it('should log in a user with correct credentials and return access token', async () => {
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

  it('should create post if the user sent valid data with existing blog id', async () => {
    const { createdBlog } = await blogsTestManager.createBlog(httpServer, {
      name: 'new name',
      description: 'new description',
      websiteUrl: 'https://www.aaaaa.com',
    });

    await getRequest()
      .get(`${RouterPaths.blogs}/${createdBlog.id}`)
      .expect(createdBlog);

    const validPostData = {
      title: 'title',
      content: 'content',
      blogId: createdBlog.id,
      shortDescription: 'shortDescription',
    };

    const { createdPost } = await postsTestManager.createPost(
      httpServer,
      validPostData,
      HTTP_STATUSES.CREATED_201,
    );

    newPost = createdPost;
    newBlog = createdBlog;

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

  it("shouldn't create a new comment if user is not authorized", async () => {
    await commentsTestManager.createComment(
      httpServer,
      invalidCommentData,
      '12',
      'aaaa',
      HTTP_STATUSES.UNAUTHORIZED_401,
    );
  });

  it("shouldn't create a new comment with wrong payload", async () => {
    await commentsTestManager.createComment(
      httpServer,
      invalidCommentData,
      '12',
      accessTokenUser1,
      HTTP_STATUSES.BAD_REQUEST_400,
    );
  });

  it("shouldn't create a new comment for non-existent post", async () => {
    await commentsTestManager.createComment(
      httpServer,
      validCommentData,
      '12',
      accessTokenUser1,
      HTTP_STATUSES.NOT_FOUND_404,
    );
  });

  it('should create a new comment for existing post', async () => {
    const { createdComment } = await commentsTestManager.createComment(
      httpServer,
      validCommentData,
      newPost.id,
      accessTokenUser1,
      HTTP_STATUSES.CREATED_201,
      user1.id,
      user1.login,
    );

    comment1 = createdComment;
    newComments.push(createdComment);
  });

  it('should return correctly filtered and sorted comments', async () => {
    const pageNumber = 2;
    const pageSize = 2;

    const secondComment = await commentsTestManager.createComment(
      httpServer,
      {
        ...validCommentData,
        content: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      },
      newPost.id,
      accessTokenUser1,
      HTTP_STATUSES.CREATED_201,
      user1.id,
      user1.login,
    );

    const thirdComment = await commentsTestManager.createComment(
      httpServer,
      {
        ...validCommentData,
        content: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      },
      newPost.id,
      accessTokenUser1,
      HTTP_STATUSES.CREATED_201,
      user1.id,
      user1.login,
    );

    const fourthComment = await commentsTestManager.createComment(
      httpServer,
      {
        ...validCommentData,
        content: 'cccccccccccccccccccccccccccccccc',
      },
      newPost.id,
      accessTokenUser1,
      HTTP_STATUSES.CREATED_201,
      user1.id,
      user1.login,
    );

    newComments.unshift(secondComment.createdComment);
    comment2 = secondComment.createdComment;
    newComments.unshift(thirdComment.createdComment);
    comment3 = thirdComment.createdComment;
    newComments.unshift(fourthComment.createdComment);

    const sortedComments = [...newComments]
      .sort((a, b) => a.content.localeCompare(b.content))
      .slice(
        (pageNumber - 1) * pageSize,
        (pageNumber - 1) * pageSize + pageSize,
      );

    await getRequest()
      .get(`${RouterPaths.posts}/${newPost.id}/comments`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: newComments.length,
        items: newComments,
      });

    await getRequest()
      .get(
        `${RouterPaths.posts}/${newPost.id}/comments?sortBy=content&sortDirection=asc&pageSize=${pageSize}&pageNumber=${pageNumber}`,
      )
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 2,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: newComments.length,
        items: sortedComments,
      });
  }, 10000);

  it("should return 404 status code if comment doesn't exist", async () => {
    await getRequest()
      .get(`${RouterPaths.comments}/123`)
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it('should return current comment', async () => {
    await getRequest()
      .get(`${RouterPaths.comments}/${comment1.id}`)
      .expect(HTTP_STATUSES.OK_200, comment1);
  });

  it("should return 403 status if user tries to update someone else's comment", async () => {
    const userWithCorrectData: LoginUserInputDto = {
      loginOrEmail: userData2.login,
      password: userData2.password,
    };

    const result = await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send(userWithCorrectData)
      .expect(HTTP_STATUSES.OK_200);

    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}`)
      .set('Authorization', `Bearer ${result.body.accessToken}`)
      .send({ content: 'second new content for updated comment' })
      .expect(HTTP_STATUSES.FORBIDDEN_403);

    await getRequest()
      .get(`${RouterPaths.comments}/${comment1.id}`)
      .expect(HTTP_STATUSES.OK_200, comment1);
  });

  it('should not like comment with incorrect input data', async () => {
    const updateLike = {
      likeStatus: 'ssss',
    };

    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.BAD_REQUEST_400, {
        errorsMessages: [
          { field: 'likeStatus', message: errorsConstants.likeStatus },
        ],
      });
  });

  it('should like comment with correct input data', async () => {
    const updateLike = {
      likeStatus: likeStatus.Like,
    };

    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    comment1.likesInfo.likesCount = 1;
    comment1.likesInfo.myStatus = updateLike.likeStatus;

    await getRequest()
      .get(`${RouterPaths.comments}/${comment1.id}`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(HTTP_STATUSES.OK_200, comment1);
  });

  it('should dislike comment with correct input data', async () => {
    const updateLike = {
      likeStatus: likeStatus.Dislike,
    };

    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    comment1.likesInfo.likesCount = 0;
    comment1.likesInfo.dislikesCount = 1;
    comment1.likesInfo.myStatus = updateLike.likeStatus;

    await getRequest()
      .get(`${RouterPaths.comments}/${comment1.id}`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(HTTP_STATUSES.OK_200, comment1);
  });

  it('should reset likes and dislikes', async () => {
    const updateLike = {
      likeStatus: likeStatus.None,
    };

    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    comment1.likesInfo.likesCount = 0;
    comment1.likesInfo.dislikesCount = 0;
    comment1.likesInfo.myStatus = updateLike.likeStatus;

    await getRequest()
      .get(`${RouterPaths.comments}/${comment1.id}`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(HTTP_STATUSES.OK_200, comment1);
  });

  it('should like first comment by user 1 then like by user 2 two times and dislike by user 3', async () => {
    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send({
        likeStatus: likeStatus.Like,
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .send({
        likeStatus: likeStatus.Like,
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .send({
        likeStatus: likeStatus.Like,
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser3}`)
      .send({
        likeStatus: likeStatus.Dislike,
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    comment1.likesInfo.likesCount = 2;
    comment1.likesInfo.dislikesCount = 1;
    comment1.likesInfo.myStatus = likeStatus.Like;

    await getRequest()
      .get(`${RouterPaths.comments}/${comment1.id}`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(HTTP_STATUSES.OK_200, comment1);

    await getRequest()
      .get(`${RouterPaths.comments}/${comment1.id}`)
      .expect(HTTP_STATUSES.OK_200, {
        ...comment1,
        likesInfo: {
          ...comment1.likesInfo,
          myStatus: 'None',
        },
      });

    await getRequest()
      .get(`${RouterPaths.posts}/${newPost.id}/comments`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: newComments.length,
        items: newComments,
      });

    await getRequest()
      .get(`${RouterPaths.posts}/${newPost.id}/comments`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: newComments.length,
        items: newComments.map((c) => {
          return {
            ...c,
            likesInfo: {
              ...c.likesInfo,
              myStatus: 'None',
            },
          };
        }),
      });
  }, 10000);

  it('should update current comment', async () => {
    const newCommentContent: CommentInputDto = {
      content: 'new content for updated comment',
    };
    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(newCommentContent)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await getRequest()
      .get(`${RouterPaths.comments}/${comment1.id}`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(HTTP_STATUSES.OK_200, {
        ...comment1,
        ...newCommentContent,
      });
  });

  it("shouldn't delete someone else's comment", async () => {
    const userWithCorrectData: LoginUserInputDto = {
      loginOrEmail: userData2.login,
      password: userData2.password,
    };

    const result = await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send(userWithCorrectData)
      .expect(HTTP_STATUSES.OK_200);

    await getRequest()
      .delete(`${RouterPaths.comments}/${comment1.id}`)
      .set('Authorization', `Bearer ${result.body.accessToken}`)
      .expect(HTTP_STATUSES.FORBIDDEN_403);
  });

  it('should delete certain comment', async () => {
    await sleep(10);
    const userWithCorrectData: LoginUserInputDto = {
      loginOrEmail: userData1.login,
      password: userData1.password,
    };

    const result = await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send(userWithCorrectData)
      .expect(HTTP_STATUSES.OK_200);

    await getRequest()
      .delete(`${RouterPaths.comments}/${comment1.id}`)
      .set('Authorization', `Bearer ${result.body.accessToken}`)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    const filteredComments = newComments.filter((c) => c.id !== comment1.id);

    await getRequest()
      .get(`${RouterPaths.posts}/${newPost.id}/comments`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: filteredComments.length,
        items: filteredComments,
      });
  }, 30000);
});
