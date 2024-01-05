import { CommandHandler } from '@nestjs/cqrs';
import { isUUID } from '../../../utils/utils';
import { HttpStatus } from '@nestjs/common';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionsRepository } from '../../../infrastructure/repositories/transactions/transactions.repository';
import { BlogsTransactionsRepository } from '../../../infrastructure/repositories/blogs/blogs-transactions.repository';
import { exceptionHandler } from '../../../utils/errors/exception.handler';
import sharp from 'sharp';
import { S3Adapter } from '../../../infrastructure/aws/s3.adapter';
import * as process from 'process';
import { BlogMainImage } from '../../../entities/blogs/Blog-main-image.entity';
import { BlogImagesViewType } from '../../../types/blogs/blog.images.types';

export class AddMainBlogImageCommand {
  constructor(
    public userId: string,
    public id: string,
    public file: Express.Multer.File,
  ) {}
}

@CommandHandler(AddMainBlogImageCommand)
export class AddMainBlogImageUseCase extends TransactionUseCase<
  AddMainBlogImageCommand,
  BlogImagesViewType
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly blogsTransactionsRepository: BlogsTransactionsRepository,
    private readonly transactionsRepository: TransactionsRepository,
    private readonly s3Adapter: S3Adapter,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: AddMainBlogImageCommand,
    manager: EntityManager,
  ): Promise<BlogImagesViewType> {
    const { id, userId, file } = command;

    if (!isUUID(id)) {
      exceptionHandler(HttpStatus.NOT_FOUND);
    }

    const blog = await this.blogsTransactionsRepository.findBlogById(
      id,
      manager,
    );
    if (!blog) {
      exceptionHandler(HttpStatus.NOT_FOUND);
    }

    if (blog.user.id !== userId) {
      exceptionHandler(HttpStatus.FORBIDDEN);
    }

    const image = sharp(file.buffer);
    const metadata = await image.metadata();

    const imagePathS3 = `blog/main/${userId}/main_${file.originalname}`;
    const imageUrl = `${process.env.S3_HOST}blog/main/${userId}/main_${file.originalname}`;

    const blogMainImage = BlogMainImage.create(
      imageUrl,
      metadata.width,
      metadata.height,
      metadata.size,
      blog,
    );

    await this.s3Adapter.uploadFile(imagePathS3, file.buffer, file.mimetype);

    await this.transactionsRepository.save(blogMainImage, manager);

    return await this.blogsTransactionsRepository.findBlogImages(id, manager);
  }

  async execute(command: AddMainBlogImageCommand) {
    return super.execute(command);
  }
}
