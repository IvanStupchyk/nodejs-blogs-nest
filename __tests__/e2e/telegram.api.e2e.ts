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
import * as process from 'process';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { UsersRepository } from '../../src/infrastructure/repositories/users/users.repository';
import { DataSourceRepository } from '../../src/infrastructure/repositories/transactions/data-source.repository';
import { BlogSubscribersRepository } from '../../src/infrastructure/repositories/blogs/blog-subscribers.repository';
import { SubscriptionStatus } from '../../src/constants/subscription-status.enum';

describe('tests for /blogs', () => {
  let app: INestApplication;
  let httpServer;
  let user1;
  let user2;
  let accessTokenUser1: string;
  let accessTokenUser2: string;
  let blog1: BlogViewType;
  let blog2: BlogViewType;
  let newPost: PostType;
  let secondPost: PostType;
  let dataSourceRepository: DataSourceRepository;
  let blogSubscribersRepository: BlogSubscribersRepository;
  const telegramId = 431924805; //my
  // const telegramId = 367481998; //ns
  const getRequest = () => {
    return request(httpServer);
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const serverConfig = await serverStarter();
    httpServer = serverConfig.httpServer;
    app = serverConfig.app;

    await request(httpServer).delete(`${RouterPaths.testing}/all-data`);

    const resp = await userCreator(httpServer, userData1);
    user1 = resp.user;
    accessTokenUser1 = resp.accessToken;

    const resp2 = await userCreator(httpServer, userData2);
    user2 = resp2.user;
    accessTokenUser2 = resp2.accessToken;

    dataSourceRepository =
      moduleFixture.get<DataSourceRepository>(DataSourceRepository);

    blogSubscribersRepository = moduleFixture.get<BlogSubscribersRepository>(
      BlogSubscribersRepository,
    );
  });

  afterAll(async () => {
    // await request(httpServer).delete(`${RouterPaths.testing}/all-data`);
    await app.close();
  });

  it('should create tow blogs for future tests', async () => {
    const { createdBlog } = await blogsTestManager.createBlog(
      httpServer,
      validBlogData,
      accessTokenUser1,
    );

    const secondBlog = await blogsTestManager.createBlog(
      httpServer,
      {
        name: 'Seeeeecond blog',
        description: 'desc',
        websiteUrl: 'https://www.aaaaa.com',
      },
      accessTokenUser1,
    );

    blog1 = createdBlog;
    blog2 = secondBlog.createdBlog;

    await getRequest()
      .get(RouterPaths.blogs)
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [blog2, blog1],
      });
  });

  it('should generate a link for telegram bot', async () => {
    const res = await getRequest()
      .get(`${RouterPaths.telegram}/auth-bot-link`)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .expect(HttpStatus.OK);

    expect(res.body.link).toContain(`${process.env.TELEGRAM_BOT_LINK}?start=`);
    const activationCode = res.body.link.split('start=')[1];

    const subscriber =
      await blogSubscribersRepository.findSubscriberByActivationCode(
        activationCode,
      );
    subscriber.telegramId = telegramId;
    await dataSourceRepository.save(subscriber);
  });

  it('should not subscribe to blog if blog does not exist or user did not activate a bot or not authorized', async () => {
    await getRequest()
      .post(`${RouterPaths.blogs}/${blog1.id}/subscription`)
      .expect(HttpStatus.UNAUTHORIZED);

    await getRequest()
      .post(
        `${RouterPaths.blogs}/49ede74a-a467-4ec7-995b-e96c4dc2c8dd/subscription`,
      )
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should subscribe to blog', async () => {
    await getRequest()
      .post(`${RouterPaths.blogs}/${blog1.id}/subscription`)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .expect(HttpStatus.NO_CONTENT);

    const subscriber =
      await blogSubscribersRepository.findSubscriberByTelegramId(telegramId);
    expect(subscriber.subscriptionStatus).toBe(SubscriptionStatus.Subscribed);

    // const resp0 = await getRequest()
    //   .get(`${RouterPaths.blogs}/${blog1.id}`)
    //   .expect(HttpStatus.OK);
    //
    // expect(resp0.body).toEqual({
    //   ...blog1,
    //   subscribersCount: 1,
    // });
    //
    // const resp = await getRequest()
    //   .get(`${RouterPaths.blogs}/${blog1.id}`)
    //   .set('Authorization', `Bearer ${accessTokenUser1}`)
    //   .expect(HttpStatus.OK);
    //
    // expect(resp.body).toEqual({
    //   ...blog1,
    //   subscribersCount: 1,
    //   currentUserSubscriptionStatus: SubscriptionStatus.Subscribed,
    // });
    //
    // const resp2 = await getRequest()
    //   .get(`${RouterPaths.blogs}`)
    //   .expect(HttpStatus.OK);
    //
    // expect(resp2.body.items).toEqual([
    //   blog2,
    //   {
    //     ...blog1,
    //     subscribersCount: 1,
    //   },
    // ]);
    //
    // const resp3 = await getRequest()
    //   .get(`${RouterPaths.blogger}/blogs`)
    //   .set({
    //     Authorization: `Bearer ${accessTokenUser1}`,
    //   })
    //   .expect(HttpStatus.OK);
    //
    // expect(resp3.body.items).toEqual([
    //   blog2,
    //   {
    //     ...blog1,
    //     subscribersCount: 1,
    //     currentUserSubscriptionStatus: SubscriptionStatus.Subscribed,
    //   },
    // ]);
  });

  it('should not unsubscribe to blog if blog does not exist or user did not activate a bot or not authorized', async () => {
    await getRequest()
      .delete(`${RouterPaths.blogs}/${blog1.id}/subscription`)
      .expect(HttpStatus.UNAUTHORIZED);

    await getRequest()
      .delete(`${RouterPaths.blogs}/${blog1.id}/subscription`)
      .set({
        Authorization: `Bearer ${accessTokenUser2}`,
      })
      .expect(HttpStatus.NOT_FOUND);

    await getRequest()
      .delete(
        `${RouterPaths.blogs}/49ede74a-a467-4ec7-995b-e96c4dc2c8dd/subscription`,
      )
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should unsubscribe and subscribe to blog', async () => {
    await getRequest()
      .delete(`${RouterPaths.blogs}/${blog1.id}/subscription`)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .expect(HttpStatus.NO_CONTENT);

    const resp = await getRequest()
      .get(`${RouterPaths.blogs}/${blog1.id}`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(HttpStatus.OK);

    expect(resp.body).toEqual({
      ...blog1,
      subscribersCount: 0,
      currentUserSubscriptionStatus: SubscriptionStatus.Unsubscribed,
    });

    const subscriber =
      await blogSubscribersRepository.findSubscriberByTelegramId(telegramId);
    expect(subscriber.subscriptionStatus).toBe(SubscriptionStatus.Unsubscribed);

    await getRequest()
      .post(`${RouterPaths.blogs}/${blog1.id}/subscription`)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .expect(HttpStatus.NO_CONTENT);

    const subscriber2 =
      await blogSubscribersRepository.findSubscriberByUserIdAndBlogId(
        user1.id,
        blog1.id,
      );
    expect(subscriber2.subscriptionStatus).toBe(SubscriptionStatus.Subscribed);
    expect(subscriber2.blog).toBeTruthy();
  });

  it('should subscribe to another blog and send messages to telegram', async () => {
    await getRequest()
      .post(`${RouterPaths.blogs}/${blog2.id}/subscription`)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .expect(HttpStatus.NO_CONTENT);

    await getRequest()
      .post(`${RouterPaths.blogs}/${blog1.id}/subscription`)
      .set({
        Authorization: `Bearer ${accessTokenUser2}`,
      })
      .expect(HttpStatus.NO_CONTENT);

    const resp = await getRequest()
      .get(`${RouterPaths.blogs}/${blog1.id}`)
      .expect(HttpStatus.OK);

    expect(resp.body).toEqual({
      ...blog1,
      subscribersCount: 1,
    });

    const resp2 = await getRequest()
      .get(`${RouterPaths.blogs}`)
      .expect(HttpStatus.OK);

    expect(resp2.body.items).toEqual([
      {
        ...blog2,
        subscribersCount: 1,
      },
      {
        ...blog1,
        subscribersCount: 1,
      },
    ]);

    const resp3 = await getRequest()
      .get(`${RouterPaths.blogs}`)
      .set({
        Authorization: `Bearer ${accessTokenUser2}`,
      })
      .expect(HttpStatus.OK);

    expect(resp3.body.items).toEqual([
      {
        ...blog2,
        subscribersCount: 1,
      },
      {
        ...blog1,
        subscribersCount: 1,
        currentUserSubscriptionStatus: SubscriptionStatus.Subscribed,
      },
    ]);

    const resp4 = await getRequest()
      .get(`${RouterPaths.blogger}/blogs`)
      .set({
        Authorization: `Bearer ${accessTokenUser1}`,
      })
      .expect(HttpStatus.OK);

    expect(resp4.body.items).toEqual([
      {
        ...blog2,
        subscribersCount: 1,
        currentUserSubscriptionStatus: SubscriptionStatus.Subscribed,
      },
      { ...blog1, subscribersCount: 1 },
    ]);

    await postsTestManager.createPostForSpecifiedBlog(
      httpServer,
      {
        ...validPostData,
        blogId: blog1.id,
      },
      blog1.id,
      accessTokenUser1,
    );

    await postsTestManager.createPostForSpecifiedBlog(
      httpServer,
      {
        ...validPostData,
        blogId: blog2.id,
      },
      blog2.id,
      accessTokenUser1,
    );
  });
});
