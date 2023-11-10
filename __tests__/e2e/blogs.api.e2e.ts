import request from 'supertest';
import { HTTP_STATUSES } from '../../src/utils/utils';
import { blogsTestManager } from '../utils/blogs-test-manager';
import { mockBlogs } from '../../src/constants/blanks';
import { ObjectId } from 'mongodb';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSettings } from '../../src/app.settings';
import { INestApplication } from '@nestjs/common';
import { NewBlogDto } from '../../src/controllers/blogs/models/new-blog.dto';
import { NewPostDto } from '../../src/controllers/posts/models/new-post.dto';
import { RouterPaths } from '../../src/constants/router.paths';
import { BlogType } from '../../src/domains/blogs/dto/blog.dto';
import { PostType } from '../../src/domains/posts/dto/post.dto';
import { postsTestManager } from '../utils/posts-test-manager';

describe('tests for /blogs', () => {
  const invalidData: NewBlogDto = {
    name: '',
    description: '',
    websiteUrl: '',
  };

  const validData: NewBlogDto = {
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

  const newBlogs: Array<BlogType> = [];

  it('should return 200 and an empty blogs array', async () => {
    await getRequest()
      .get(RouterPaths.blogs)
      .expect(HTTP_STATUSES.OK_200, mockBlogs);
  });

  it('should return 404 for not existing blog', async () => {
    await getRequest()
      .get(RouterPaths.blogs + '/3423')
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it("shouldn't create a blog if the user is not logged in", async () => {
    await blogsTestManager.createBlog(
      httpServer,
      invalidData,
      HTTP_STATUSES.UNAUTHORIZED_401,
      'sssss',
    );
  });

  it("shouldn't create a blog if the user sends invalid data", async () => {
    const { response } = await blogsTestManager.createBlog(
      httpServer,
      invalidData,
      HTTP_STATUSES.BAD_REQUEST_400,
    );

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'name',
          message: 'name must be longer than or equal to 1 characters',
        },
        {
          field: 'description',
          message: 'description must be longer than or equal to 1 characters',
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
      .expect(HTTP_STATUSES.OK_200, mockBlogs);
  });

  let newBlog: BlogType;
  let newPost: PostType;
  let secondPost: PostType;
  it('should create a blog if the user sends the valid data', async () => {
    const { createdBlog } = await blogsTestManager.createBlog(
      httpServer,
      validData,
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
  });

  it('should return all posts for specified blog', async () => {
    validPostData = {
      ...validPostData,
      blogId: newBlog.id,
    };
    const { createdPost } = await postsTestManager.createPost(
      httpServer,
      validPostData,
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
      .get(`${RouterPaths.blogs}/${newBlog.id}/posts`)
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

    const secondBlog = await blogsTestManager.createBlog(httpServer, {
      ...validData,
      name: 'second',
      description: 'a',
    });

    const thirdBlog = await blogsTestManager.createBlog(httpServer, {
      ...validData,
      name: 'third',
      description: 'b',
    });

    const fourthBlog = await blogsTestManager.createBlog(httpServer, {
      ...validData,
      name: 'fourth',
      description: 'c',
    });

    newBlogs.unshift(secondBlog.createdBlog);
    newBlogs.unshift(thirdBlog.createdBlog);
    newBlogs.unshift(fourthBlog.createdBlog);

    const sortedBlogs = [...newBlogs]
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(
        (pageNumber - 1) * pageSize,
        (pageNumber - 1) * pageSize + pageSize,
      );

    await getRequest().get(RouterPaths.blogs).expect(HTTP_STATUSES.OK_200, {
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 4,
      items: newBlogs,
    });

    await getRequest()
      .get(`${RouterPaths.blogs}?searchNameTerm=second`)
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
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 2,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: newBlogs.length,
        items: sortedBlogs,
      });
  });

  it('should create a new post for specific blog', async () => {
    validPostData = {
      ...validPostData,
      blogId: newBlog.id,
    };
    const { createdPost } = await postsTestManager.createPostForSpecifiedBlog(
      httpServer,
      { ...validPostData, title: 'second' },
      newBlog.id,
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
      .get(`${RouterPaths.blogs}/${newBlog.id}/posts`)
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
      .put(`${RouterPaths.blogs}/22`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(validData)
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it('should update a blog with valid data', async () => {
    const updatedValidData = {
      ...validData,
      name: 'updated name',
    };
    await getRequest()
      .put(`${RouterPaths.blogs}/${newBlog.id}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(updatedValidData)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await getRequest()
      .get(`${RouterPaths.blogs}/${newBlog.id}`)
      .expect({
        ...newBlog,
        name: updatedValidData.name,
      });
  });

  it("shouldn't delete a blog if the blog doesn't exist", async () => {
    await getRequest()
      .delete(`${RouterPaths.blogs}/22`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(validData)
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it('should delete a blog with exiting id', async () => {
    await getRequest()
      .delete(`${RouterPaths.blogs}/${newBlog.id}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    const filteredBlogs = newBlogs.filter((b) => b.id !== newBlog.id);

    await getRequest().get(RouterPaths.blogs).expect(HTTP_STATUSES.OK_200, {
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: filteredBlogs.length,
      items: filteredBlogs,
    });
  });
});
