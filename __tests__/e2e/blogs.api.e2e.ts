import request from 'supertest';
import { HTTP_STATUSES } from '../../src/utils/utils';
import { blogsTestManager } from '../utils/blogs-test-manager';
import { mockBlogs } from '../../src/constants/blanks';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSettings } from '../../src/app.settings';
import { INestApplication } from '@nestjs/common';
import { BlogInputDto } from '../../src/dto/blogs/blog.input.dto';
import { PostInputDto } from '../../src/dto/posts/post.input.dto';
import { RouterPaths } from '../../src/constants/router.paths';
import { BlogModel } from '../../src/models/blogs/Blog.model';
import { postsTestManager } from '../utils/posts-test-manager';
import { v4 as uuidv4 } from 'uuid';
import { PostModel } from '../../src/models/posts/Post.model';

describe('tests for /blogs', () => {
  const invalidData: BlogInputDto = {
    name: '',
    description: '',
    websiteUrl: '',
  };

  const validData: BlogInputDto = {
    name: 'new name',
    description: 'new description',
    websiteUrl: 'https://www.aaaaa.com',
  };

  const validPostData: PostInputDto = {
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

  const newBlogs: Array<BlogModel> = [];

  it('should return 200 and an empty blogs array', async () => {
    await getRequest()
      .get(RouterPaths.saBlogs)
      .expect(HTTP_STATUSES.OK_200, mockBlogs);
  });

  it('should return 404 for not existing blog', async () => {
    await getRequest()
      .get(RouterPaths.saBlogs + '/3423')
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
      .get(RouterPaths.saBlogs)
      .expect(HTTP_STATUSES.OK_200, mockBlogs);
  });

  let newBlog: BlogModel;
  let newPost: PostModel;
  let secondPost: PostModel;
  it('should create a blog if the user sends the valid data', async () => {
    const { createdBlog } = await blogsTestManager.createBlog(
      httpServer,
      validData,
    );

    newBlog = createdBlog;
    newBlogs.push(createdBlog);

    await getRequest()
      .get(RouterPaths.saBlogs)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [createdBlog],
      });
  });

  // it('should return all posts for specified blog', async () => {
  //   validPostData = {
  //     ...validPostData,
  //     blogId: newBlog.id,
  //   };
  //   const { createdPost } = await postsTestManager.createPost(
  //     httpServer,
  //     validPostData,
  //     HTTP_STATUSES.CREATED_201,
  //   );
  //
  //   newPost = createdPost;
  //
  //   await getRequest()
  //     .get(RouterPaths.posts)
  //     .expect(HTTP_STATUSES.OK_200, {
  //       pagesCount: 1,
  //       page: 1,
  //       pageSize: 10,
  //       totalCount: 1,
  //       items: [createdPost],
  //     });
  //
  //   await getRequest()
  //     .get(`${RouterPaths.saBlogs}/${newBlog.id}/posts`)
  //     .expect(HTTP_STATUSES.OK_200, {
  //       pagesCount: 1,
  //       page: 1,
  //       pageSize: 10,
  //       totalCount: 1,
  //       items: [createdPost],
  //     });
  // });

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

    await getRequest().get(RouterPaths.saBlogs).expect(HTTP_STATUSES.OK_200, {
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 4,
      items: newBlogs,
    });

    await getRequest()
      .get(`${RouterPaths.saBlogs}?searchNameTerm=second`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [secondBlog.createdBlog],
      });

    await getRequest()
      .get(
        `${RouterPaths.saBlogs}?sortBy=name&sortDirection=asc&pageSize=${pageSize}&pageNumber=${pageNumber}`,
      )
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 2,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: newBlogs.length,
        items: sortedBlogs,
      });
  });

  // it('should create a new post for specific blog', async () => {
  //   validPostData = {
  //     ...validPostData,
  //     blogId: newBlog.id,
  //   };
  //   const { createdPost } = await postsTestManager.createPostForSpecifiedBlog(
  //     httpServer,
  //     { ...validPostData, title: 'second' },
  //     newBlog.id,
  //     HTTP_STATUSES.CREATED_201,
  //   );
  //
  //   secondPost = createdPost;
  //
  //   await getRequest()
  //     .get(RouterPaths.posts)
  //     .expect(HTTP_STATUSES.OK_200, {
  //       pagesCount: 1,
  //       page: 1,
  //       pageSize: 10,
  //       totalCount: 2,
  //       items: [createdPost, newPost],
  //     });
  //
  //   await getRequest()
  //     .get(`${RouterPaths.saBlogs}/${newBlog.id}/posts`)
  //     .expect(HTTP_STATUSES.OK_200, {
  //       pagesCount: 1,
  //       page: 1,
  //       pageSize: 10,
  //       totalCount: 2,
  //       items: [createdPost, newPost],
  //     });
  // });

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
      .put(`${RouterPaths.saBlogs}/22`)
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
      .put(`${RouterPaths.saBlogs}/${newBlog.id}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(updatedValidData)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await getRequest()
      .get(`${RouterPaths.saBlogs}/${newBlog.id}`)
      .expect({
        ...newBlog,
        name: updatedValidData.name,
      });
  });

  it("shouldn't delete a blog if the blog doesn't exist", async () => {
    await getRequest()
      .delete(`${RouterPaths.saBlogs}/22`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(validData)
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it('should delete a blog with exiting id', async () => {
    await getRequest()
      .delete(`${RouterPaths.saBlogs}/${newBlog.id}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    const filteredBlogs = newBlogs.filter((b) => b.id !== newBlog.id);

    await getRequest().get(RouterPaths.saBlogs).expect(HTTP_STATUSES.OK_200, {
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: filteredBlogs.length,
      items: filteredBlogs,
    });
  });
});
