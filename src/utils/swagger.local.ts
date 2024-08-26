import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export const swaggerLocal = (app: INestApplication<any>) => {
  const config = new DocumentBuilder()
    .setTitle('blogger platform')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('swagger')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document);
};
