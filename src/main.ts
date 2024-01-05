import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSettings } from './app.settings';
import * as ngrok from 'ngrok';

const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000/';

async function connectToNgrok() {
  return ngrok.connect(3000);
  // return ngrok.connect({
  //   addr: Number(3000),
  //   authtoken: '2aPKdrO5Lxyly5ebWFPLPYaF0YZ_2p5qiPRwZ4RDj3cfaJnyQ',
  // });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appSettings(app);
  await app.listen(3000);

  if (process.env.NODE_ENV === 'development') {
    // appBaseUrl = await connectToNgrok();
    console.log('appBaseUrl', appBaseUrl);
  }
}
bootstrap();
