import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isUUID } from '../../../utils/utils';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs/blogs.repository';
import { BlogViewType } from '../../../types/blogs/blogs.types';
import { exceptionHandler } from '../../../utils/errors/exception.handler';
import { HttpStatus } from '@nestjs/common';
import { SubscriptionStatus } from '../../../constants/subscription-status.enum';

export class FindBlogByIdCommand {
  constructor(public id: string) {}
}

@CommandHandler(FindBlogByIdCommand)
export class FindBlogByIdUseCase
  implements ICommandHandler<FindBlogByIdCommand>
{
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: FindBlogByIdCommand): Promise<BlogViewType | null> {
    if (!isUUID(command.id)) return null;
    const blog = await this.blogsRepository.findBlogById(command.id);
    console.log('blog', blog);
    if (!blog || blog.b_isBanned) {
      exceptionHandler(HttpStatus.NOT_FOUND);
    }

    return blog
      ? {
          id: blog.b_id,
          name: blog.b_name,
          description: blog.b_description,
          websiteUrl: blog.b_websiteUrl,
          isMembership: blog.b_isMembership,
          createdAt: blog.b_createdAt,
          images: {
            wallpaper: blog.wp_id
              ? {
                  url: blog.wp_url,
                  width: blog.wp_width,
                  height: blog.wp_height,
                  fileSize: blog.wp_fileSize,
                }
              : null,
            main: blog.blog_images
              ? blog.blog_images.map((i) => {
                  return {
                    url: i.url,
                    width: i.width,
                    height: i.height,
                    fileSize: i.fileSize,
                  };
                })
              : [],
          },
          subscribersCount: 0,
          currentUserSubscriptionStatus: SubscriptionStatus.None,
        }
      : null;
  }
}
