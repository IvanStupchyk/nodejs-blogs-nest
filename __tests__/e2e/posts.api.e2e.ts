import request from 'supertest';
import { HTTP_STATUSES } from '../../src/utils/utils';
import { blogsTestManager } from '../utils/blogs-test-manager';
import { postsTestManager } from '../utils/posts-test-manager';
import { mockPosts } from '../../src/constants/blanks';
import { RouterPaths } from '../../src/constants/router.paths';
import { INestApplication } from '@nestjs/common';
import { PostInputDto } from '../../src/dto/posts/post.input.dto';
import { BlogModel } from '../../src/models/blogs/Blog.model';
import { v4 as uuidv4 } from 'uuid';
import { PostModel } from '../../src/models/posts/Post.model';
import { invalidPostData, validBlogData } from '../mockData/mock-data';
import { serverStarter } from '../utils/server-starter';

describe('tests for /posts', () => {
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
    await app.close();
  });

  it('should return 200 and an empty posts array', async () => {
    await getRequest()
      .get(RouterPaths.posts)
      .expect(HTTP_STATUSES.OK_200, mockPosts);
  });

  it('should return 404 for not existing post', async () => {
    await getRequest()
      .get(RouterPaths.posts + '/3423')
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it("shouldn't create a post if the user is not logged in", async () => {
    await postsTestManager.createPost(
      httpServer,
      invalidPostData,
      HTTP_STATUSES.UNAUTHORIZED_401,
      'sssss',
    );
  });

  it("shouldn't create a post if the user sends invalid data", async () => {
    const { response } = await postsTestManager.createPost(
      httpServer,
      invalidPostData,
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
        {
          field: 'blogId',
          message: 'such blog should exist',
        },
      ],
    });

    await getRequest()
      .get(RouterPaths.posts)
      .expect(HTTP_STATUSES.OK_200, mockPosts);
  });

  let newPost: PostModel;
  const newPosts: Array<PostModel> = [];
  let newBlog: BlogModel;
  it('should create a post if the user sent valid data with existing blog id', async () => {
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
    const { createdPost } = await postsTestManager.createPost(
      httpServer,
      validPostData,
      HTTP_STATUSES.CREATED_201,
    );

    newPost = createdPost;
    newBlog = createdBlog;
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

    const secondPost = await postsTestManager.createPost(httpServer, {
      ...validPostData,
      title: 'second',
    });

    const thirdPost = await postsTestManager.createPost(httpServer, {
      ...validPostData,
      title: 'third',
    });

    const fourthPost = await postsTestManager.createPost(httpServer, {
      ...validPostData,
      title: 'fourth',
    });

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

  it("shouldn't update post if the post doesn't exist", async () => {
    await getRequest()
      .put(`${RouterPaths.posts}/22`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(validPostData)
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it('should update a post with valid data', async () => {
    const updatedValidData = {
      ...validPostData,
      title: 'updated title',
    };
    await getRequest()
      .put(`${RouterPaths.saBlogs}/${newPost.blogId}/posts/${newPost.id}`)
      .auth('admin', 'qwerty', { type: 'basic' })
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
      .delete(`${RouterPaths.posts}/22`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(validPostData)
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it('should delete a post with exiting id', async () => {
    await getRequest()
      .delete(`${RouterPaths.saBlogs}/${newPost.blogId}/posts/${newPost.id}`)
      .auth('admin', 'qwerty', { type: 'basic' })
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
      .get(RouterPaths.saBlogs)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [newBlog],
      });
  });
});
