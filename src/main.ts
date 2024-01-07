import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSettings } from './app.settings';
import * as ngrok from 'ngrok';
import * as process from 'process';
import { TelegramAdapter } from './infrastructure/telegram/telegram.adapter';

let appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000/';

async function connectToNgrok() {
  return ngrok.connect(3000);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appSettings(app);
  await app.listen(3000);

  const telegramAdapter = await app.resolve(TelegramAdapter);

  if (process.env.NODE_ENV === 'development') {
    appBaseUrl = await connectToNgrok();
    console.log('appBaseUrl', appBaseUrl);
  }

  await telegramAdapter.setWebhook(
    appBaseUrl + '/integrations/telegram/webhook',
  );
}
bootstrap();
