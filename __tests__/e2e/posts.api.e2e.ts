import request from 'supertest';
import { HTTP_STATUSES } from '../../src/utils/utils';
import { blogsTestManager } from '../utils/blogs-test-manager';
import { postsTestManager } from '../utils/posts-test-manager';
import { mockPosts } from '../../src/constants/blanks';
import { ObjectId } from 'mongodb';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSettings } from '../../src/app.settings';
import { RouterPaths } from '../../src/constants/router.paths';
import { INestApplication } from '@nestjs/common';
import { NewPostDto } from '../../src/controllers/posts/models/new-post.dto';
import { NewBlogDto } from '../../src/controllers/blogs/models/new-blog.dto';
import { PostType } from '../../src/domains/posts/dto/post.dto';
import { BlogType } from '../../src/domains/blogs/dto/blog.dto';

describe('tests for /posts', () => {
  const invalidData = {
    title: '',
    content: '',
    blogId: '',
    shortDescription: '',
  };

  const validBlogData: NewBlogDto = {
    name: 'new name',
    description: 'new description',
    websiteUrl: 'https://www.aaaaa.com',
  };

  let validPostData: NewPostDto = {
    title: 'title',
    content: 'content',
    blogId: new ObjectId(),
    shortDescription: 'shortDescription',
  };

  let app: INestApplication;
  let httpServer;

  const getRequest = () => {
    return request(httpServer);
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    appSettings(app);

    await app.init();
    httpServer = app.getHttpServer();

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
      invalidData,
      HTTP_STATUSES.UNAUTHORIZED_401,
      'sssss',
    );
  });

  it("shouldn't create a post if the user sends invalid data", async () => {
    const { response } = await postsTestManager.createPost(
      httpServer,
      invalidData,
      HTTP_STATUSES.BAD_REQUEST_400,
    );

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'title',
          message: 'title must be longer than or equal to 1 characters',
        },
        {
          field: 'shortDescription',
          message:
            'shortDescription must be longer than or equal to 1 characters',
        },
        {
          field: 'content',
          message: 'content must be longer than or equal to 1 characters',
        },
        {
          field: 'blogId',
          message: 'blogId must be a mongodb id',
        },
      ],
    });

    await getRequest()
      .get(RouterPaths.posts)
      .expect(HTTP_STATUSES.OK_200, mockPosts);
  });

  let newPost: PostType;
  const newPosts: Array<PostType> = [];
  let newBlog: BlogType;
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
      .put(`${RouterPaths.posts}/${newPost.id}`)
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
      .delete(`${RouterPaths.posts}/${newPost.id}`)
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
      .get(RouterPaths.blogs)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [newBlog],
      });
  });
});
