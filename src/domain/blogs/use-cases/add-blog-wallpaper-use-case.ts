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
import { BlogImagesViewType } from '../../../types/blogs/blog.images.types';
import { BlogWallpaper } from '../../../entities/blogs/Blog-wallpaper.entity';

export class AddBlogWallpaperCommand {
  constructor(
    public userId: string,
    public id: string,
    public file: Express.Multer.File,
  ) {}
}

@CommandHandler(AddBlogWallpaperCommand)
export class AddBlogWallpaperUseCase extends TransactionUseCase<
  AddBlogWallpaperCommand,
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
    command: AddBlogWallpaperCommand,
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

    const imagePathS3 = `blog/wallpaper/${userId}/wl_${file.originalname}`;
    const imageUrl = `${process.env.S3_HOST}blog/wallpaper/${userId}/wl_${file.originalname}`;

    const wallpaper = await this.blogsTransactionsRepository.findBlogWallpaper(
      id,
      manager,
    );

    let blogWallpaper: BlogWallpaper;
    if (wallpaper) {
      blogWallpaper = BlogWallpaper.update(
        wallpaper,
        imageUrl,
        metadata.width,
        metadata.height,
        metadata.size,
        blog,
      );
    } else {
      blogWallpaper = BlogWallpaper.create(
        imageUrl,
        metadata.width,
        metadata.height,
        metadata.size,
        blog,
      );
    }

    await this.s3Adapter.uploadFile(imagePathS3, file.buffer, file.mimetype);

    await this.transactionsRepository.save(blogWallpaper, manager);

    return await this.blogsTransactionsRepository.findBlogImages(id, manager);
  }

  async execute(command: AddBlogWallpaperCommand) {
    return super.execute(command);
  }
}
