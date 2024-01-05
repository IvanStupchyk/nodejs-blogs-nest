import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Blog } from '../../../entities/blogs/Blog.entity';
import { BlogImagesViewType } from '../../../types/blogs/blog.images.types';
import { BlogWallpaper } from '../../../entities/blogs/Blog-wallpaper.entity';

@Injectable()
export class BlogsTransactionsRepository {
  async deleteBlog(id: string, manager: EntityManager): Promise<boolean> {
    const result = await manager
      .createQueryBuilder(Blog, 'b')
      .delete()
      .from(Blog)
      .where('id = :id', { id })
      .execute();

    return !!result.affected;
  }

  async findBlogById(id: string, manager: EntityManager): Promise<Blog | null> {
    return await manager
      .createQueryBuilder(Blog, 'b')
      .leftJoinAndSelect('b.user', 'user')
      .where('b.id = :id', {
        id,
      })
      .getOne();
  }

  async findBlogWallpaper(
    id: string,
    manager: EntityManager,
  ): Promise<BlogWallpaper | null> {
    return await manager
      .createQueryBuilder(BlogWallpaper, 'bw')
      .where('bw.blogId = :id', {
        id,
      })
      .getOne();
  }

  async findBlogImages(
    id: string,
    manager: EntityManager,
  ): Promise<BlogImagesViewType> {
    const blog = await manager
      .createQueryBuilder(Blog, 'b')
      .leftJoinAndSelect('b.blogMainImages', 'bm')
      .leftJoinAndSelect('b.blogWallpaper', 'bw')
      .where('b.id = :id', {
        id,
      })
      .getOne();

    return {
      wallpaper: blog.blogWallpaper
        ? {
            url: blog.blogWallpaper.url,
            width: blog.blogWallpaper.width,
            height: blog.blogWallpaper.height,
            fileSize: blog.blogWallpaper.fileSize,
          }
        : null,
      main: blog.blogMainImages.length
        ? blog.blogMainImages.map((i) => {
            return {
              url: i.url,
              width: i.width,
              height: i.height,
              fileSize: i.fileSize,
            };
          })
        : [],
    };
  }
}
