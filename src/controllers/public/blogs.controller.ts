import {
  Controller,
  Get,
  Headers,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryDto } from '../../application/dto/blogs/blogs.query.dto';
import { PostsQueryDto } from '../../application/dto/posts/posts.query.dto';
import { RouterPaths } from '../../constants/router.paths';
import { CommandBus } from '@nestjs/cqrs';
import { FindBlogByIdCommand } from '../../domain/blogs/use-cases/find-blog-by-id-use-case';
import { ThrottlerGuard } from '@nestjs/throttler';
import { BlogsQueryRepository } from '../../infrastructure/repositories/blogs/blogs-query.repository';
import { GetPostsForSpecifiedBlogCommand } from '../../domain/posts/use-cases/get-posts-for-specified-blog-use-case';
import { GetBlogParamsDto } from '../../application/dto/blogs/get-blog.params.dto';
import { exceptionHandler } from '../../utils/errors/exception.handler';

@Controller(RouterPaths.blogs)
export class BlogController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  // simple form
  // @Get('change-page')
  // async ChangeAvatarPage() {
  //   const htmlContent = await readTextFileAsync(
  //     join('views', 'avatars', 'change-page.html'),
  //   );
  //   return htmlContent;
  // }

  // process form with a file
  // @Post('avatars')
  // @UseInterceptors(FileInterceptor('avatar'))
  // async SaveAvatar(@UploadedFile() avatarFile: Express.Multer.File) {
  //   const userId = '10';
  //   await this.saveUserAvatarUseCase.execute(
  //     userId,
  //     avatarFile.originalname,
  //     avatarFile.buffer,
  //     avatarFile.mimetype,
  //   );
  //
  //   return 'avatar saved';
  // }

  @UseGuards(ThrottlerGuard)
  @Get()
  async getBlogs(@Query() params: BlogsQueryDto) {
    return await this.blogsQueryRepository.getSortedBlogs(params);
  }

  @Get(':id')
  async getCurrentBlog(@Param() params: GetBlogParamsDto) {
    const foundBlog = await this.commandBus.execute(
      new FindBlogByIdCommand(params.id),
    );

    if (!foundBlog) {
      return exceptionHandler(HttpStatus.NOT_FOUND);
    }

    return foundBlog;
  }

  @Get(':id/posts')
  async getPostsForSpecifiedBlogForAllUsers(
    @Param() params: GetBlogParamsDto,
    @Query() query: PostsQueryDto,
    @Headers() headers: any,
  ) {
    const posts = await this.commandBus.execute(
      new GetPostsForSpecifiedBlogCommand(
        query,
        params.id,
        headers?.authorization,
      ),
    );

    if (!posts) {
      return exceptionHandler(HttpStatus.NOT_FOUND);
    }

    return posts;
  }
}
