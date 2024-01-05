import { CommandHandler } from '@nestjs/cqrs';
import { isUUID } from '../../../utils/utils';
import { HttpStatus } from '@nestjs/common';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionsRepository } from '../../../infrastructure/repositories/transactions/transactions.repository';
import { PostsTransactionsRepository } from '../../../infrastructure/repositories/posts/posts-transactions.repository';
import { BlogsTransactionsRepository } from '../../../infrastructure/repositories/blogs/blogs-transactions.repository';
import { exceptionHandler } from '../../../utils/errors/exception.handler';
import sharp from 'sharp';
import { PostImage } from '../../../entities/posts/Post-image.entity';
import { S3Adapter } from '../../../infrastructure/aws/s3.adapter';
import { PostImageViewType } from '../../../types/posts/post.image.types';
import * as process from 'process';

export class AddImagePostCommand {
  constructor(
    public userId: string,
    public blogId: string,
    public postId: string,
    public file: Express.Multer.File,
  ) {}
}

@CommandHandler(AddImagePostCommand)
export class AddImagePostUseCase extends TransactionUseCase<
  AddImagePostCommand,
  PostImageViewType
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly postsTransactionsRepository: PostsTransactionsRepository,
    private readonly blogsTransactionsRepository: BlogsTransactionsRepository,
    private readonly transactionsRepository: TransactionsRepository,
    private readonly s3Adapter: S3Adapter,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: AddImagePostCommand,
    manager: EntityManager,
  ): Promise<PostImageViewType> {
    const { blogId, userId, postId, file } = command;

    if (!isUUID(blogId)) {
      exceptionHandler(HttpStatus.NOT_FOUND);
    }
    if (!isUUID(postId)) {
      exceptionHandler(HttpStatus.NOT_FOUND);
    }

    const blog = await this.blogsTransactionsRepository.findBlogById(
      blogId,
      manager,
    );
    if (!blog) {
      exceptionHandler(HttpStatus.NOT_FOUND);
    }

    if (blog.user.id !== userId) {
      exceptionHandler(HttpStatus.FORBIDDEN);
    }

    const post = await this.postsTransactionsRepository.findPostById(
      postId,
      manager,
    );

    if (!post) {
      exceptionHandler(HttpStatus.NOT_FOUND);
    }

    const originalImage = sharp(file.buffer);
    const originalMetadata = await originalImage.metadata();

    const originalImagePathS3 = `post/main/${userId}/lr_${file.originalname}`;
    const originalImageUrl = `${process.env.S3_HOST}post/main/${userId}/lr_${file.originalname}`;

    const postImage = PostImage.create(
      originalImageUrl,
      originalMetadata.width,
      originalMetadata.height,
      originalMetadata.size,
      post,
    );

    await this.s3Adapter.uploadFile(
      originalImagePathS3,
      file.buffer,
      file.mimetype,
    );

    await this.transactionsRepository.save(postImage, manager);

    const mediumImageBuffer = await sharp(file.buffer)
      .resize(300, 180)
      .toBuffer();
    const mediumImage = sharp(mediumImageBuffer);
    const mediumMetadata = await mediumImage.metadata();

    const mediumImagePathS3 = `post/main/${userId}/md_${file.originalname}`;
    const mediumImageUrl = `${process.env.S3_HOST}post/main/${userId}/md_${file.originalname}`;

    const mediumPostImage = PostImage.create(
      mediumImageUrl,
      mediumMetadata.width,
      mediumMetadata.height,
      mediumMetadata.size,
      post,
    );

    await this.s3Adapter.uploadFile(
      mediumImagePathS3,
      mediumImageBuffer,
      file.mimetype,
    );

    await this.transactionsRepository.save(mediumPostImage, manager);

    const smallImageBuffer = await sharp(file.buffer)
      .resize(149, 96)
      .toBuffer();
    const smallImage = sharp(smallImageBuffer);
    const smallMetadata = await smallImage.metadata();

    const smallImagePathS3 = `post/main/${userId}/sm_${file.originalname}`;
    const smallImageUrl = `${process.env.S3_HOST}post/main/${userId}/sm_${file.originalname}`;

    const smallPostImage = PostImage.create(
      smallImageUrl,
      smallMetadata.width,
      smallMetadata.height,
      smallMetadata.size,
      post,
    );

    await this.s3Adapter.uploadFile(
      smallImagePathS3,
      smallImageBuffer,
      file.mimetype,
    );

    await this.transactionsRepository.save(smallPostImage, manager);

    return await this.postsTransactionsRepository.findPostImages(
      postId,
      manager,
    );
  }

  async execute(command: AddImagePostCommand) {
    return super.execute(command);
  }
}
