import { Injectable } from '@nestjs/common';
import { BlogModel } from '../../domains/blogs/dto/blog.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async createBlog(newBlog: BlogModel): Promise<BlogModel> {
    const {
      id,
      name,
      description,
      userId,
      websiteUrl,
      isMembership,
      createdAt,
    } = newBlog;

    const blog = await this.dataSource.query(
      `
    insert into public.blogs(
    "id", "name", "description", "userId", "websiteUrl", "isMembership", "createdAt"
    )
    values($1, $2, $3, $4, $5, $6, $7)
    returning "id", "name", "description", "websiteUrl", "isMembership", "createdAt";
    `,
      [id, name, description, userId, websiteUrl, isMembership, createdAt],
    );

    return blog[0];
  }

  async updateBlogById(
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
      update public.blogs
      set "name" = $2, "description" = $3, "websiteUrl" = $4
      where "id" = $1
    `,
      [id, name, description, websiteUrl],
    );

    return result[1] === 1;
  }

  async deleteBlog(id: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
      DELETE from public.blogs
      where "id" = $1
    `,
      [id],
    );

    return result[1] === 1;
  }

  async findBlogById(id: string): Promise<BlogModel | null> {
    const blog = await this.dataSource.query(
      `
      select "id", "name", "description", "websiteUrl", "isMembership", "createdAt" 
      from public.blogs
      where ("id" = $1)
    `,
      [id],
    );
    return blog[0];
  }

  async fetchAllBlogDataById(id: string): Promise<BlogModel | null> {
    const blog = await this.dataSource.query(
      `
      select "id", "name", "description", "userId", "websiteUrl", "isMembership", "createdAt" 
      from public.blogs
      where ("id" = $1)
    `,
      [id],
    );
    return blog[0];
  }

  async deleteAllBlogs() {
    return this.dataSource.query(`
    Delete from public.blogs
    `);
  }
}
