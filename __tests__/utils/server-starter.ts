import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSettings } from '../../src/app.settings';
import { INestApplication } from '@nestjs/common';

export const serverStarter = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication = moduleFixture.createNestApplication();

  appSettings(app);

  await app.init();
  const httpServer = app.getHttpServer();

  return { httpServer, app };
};
